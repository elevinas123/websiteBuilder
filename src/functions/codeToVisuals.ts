import { AllElements, SetAllElements } from "../Types"
import { v4 as uuidv4 } from "uuid"
import { createNewGrid } from "./gridCRUD"
import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import { Change, ChangeDetails, Modify } from "../MarkdownScreen"
import { Ast } from "./parseHTML"
import isInt from "./isInt"
export const updateAllElements = (changes: Modify[], allElements: AllElements, gridPixelSize: number, setAllElements: SetAllElements) => {
    setAllElements(
        produce(allElements, (draft) => {
            changes.forEach(({ action, visualId, change: changeDetails, newIndex, parentId, newPlace }) => {
                if (!parentId) throw new Error(`parentId must be string, got ${parentId}`)
                if (action === "add") {
                    // Adjusted to use draft directly
                    handleElementAddition(changeDetails.changed, parentId, newIndex, draft, gridPixelSize)
                } else if (action === "modify") {
                    if (!visualId) return
                    handleElementModify(changeDetails, newPlace, visualId, draft, gridPixelSize)
                } else if (action === "delete" && newPlace === "tagName") {
                    const parentElement = draft[parentId]
                    if (parentElement && parentElement.children) {
                        const index = parentElement.children.findIndex((childId) => childId === visualId)
                        if (index !== -1) {
                            // Directly mutate the draft's children array to remove the element
                            parentElement.children.splice(index, 1)
                        }
                    }
                } else {
                    console.warn("Unknown action type or unsupported change detected:", action)
                }
            })
        })
    )
}
const addElementRecursively = (
    change: Ast | string,
    parentId: string,
    draft: AllElements,
    gridPixelSize: number,
    offsetLeft = 1,
    offsetTop = 1
): [AllElements, string, number, number] => {
    if (typeof change === "string") throw new Error(`change cant be of type string, got ${change}`)
    const newElementId = uuidv4()

    const { text, childrenIds, totalHeight } = processChildNodes(change.childNodes || [], newElementId, draft, offsetTop)
    const elementWidth = 10
    const elementHeigth = 10
    draft[newElementId] = createNewGrid(
        newElementId,
        parentId,
        offsetLeft,
        totalHeight,
        elementWidth, // elementWidth,
        elementHeigth, // elementHeight,
        { top: 0, left: 0, bottom: 0, right: 0 },
        gridPixelSize,
        childrenIds
    )

    return [draft, newElementId, elementWidth, elementHeigth]
}

function isAst(value: any): value is Ast {
    return value && "childNodes" in value
}

const handleElementAddition = (changeDetails: Change, parentId: string | null, index: number, draft: AllElements, gridPixelSize: number) => {
    if (!parentId) throw new Error(`parentId must be string, got ${parentId}`)
    console.log("changeDetails", changeDetails)
    if (!changeDetails) throw new Error(`parentId must be string, got ${parentId}`)
    if (!isAst(changeDetails)) throw new Error(`ChangeDetails must be ast, got ${changeDetails}`)
    console.log(changeDetails)
    let elementsIds = []
    let totalHeight = calculateStartingHeight(parentId, 0, draft) + 1 // +1 to start from the next possible height

    // Directly use `addElementRecursively` to modify the draft
    const [, childId, , h] = addElementRecursively(changeDetails, parentId, draft, gridPixelSize, 1, totalHeight)
    elementsIds.push(childId)
    totalHeight += h
    draft[parentId].children.splice(index, 0, childId)

    return { draft, elementsIds, totalHeight } // Return draft for clarity, even though it's modified in place
}
const handleElementModify = (changeDetails: ChangeDetails, newPlace: string, id: string, draft: AllElements, gridPixelSize: number) => {
    const element = draft[id]
    if (!element) return // Early return if the element doesn't exist
    console.log("atejo iki cia")
    if (changeDetails.place === "classname") {
        console.log("classNamechange", changeDetails)
        if (typeof changeDetails.changed !== "string") throw new Error(`changed must be string, got ${changeDetails.changed}`)
        const cssClasses = tailwindClassToCSS(changeDetails.changed)

        element.info = {
            ...element.info,
            ...cssClasses,
        }
        element.info.contentWidth =
            element.info.itemWidth -
            element.info.border.borderLeft.borderWidth -
            element.info.border.borderRight.borderWidth -
            element.info.padding.left -
            element.info.padding.right
        element.info.contentHeight =
            element.info.itemHeight -
            element.info.border.borderTop.borderWidth -
            element.info.border.borderBottom.borderWidth -
            element.info.padding.top -
            element.info.padding.bottom
        // Apply new styles calculated based on potential changes
        const newStyles = calculateNewStyle(
            element.info.left,
            element.info.top,
            element.info.itemWidth,
            element.info.itemHeight,
            gridPixelSize,
            element.info.backgroundColor
        )
        element.style = { ...element.style, ...newStyles }
    } else if (changeDetails.place === "text" && typeof changeDetails.changed === "string") {
        element.text = changeDetails.changed
    } else if (changeDetails.place === "tagName") {
        //I will add tag functionality later
    }

    return
}

export interface CssStyles {
    [s: string]: string | number
}

const tailwindClassToCSS = (classNames: string): CssStyles => {
    const unitToPx = (unit: number) => `${unit * 4}px` // Ensure the unit is a string with px for CSS

    const tailwindToInfoMappings: { [key: string]: string | number } = {
        w: "itemWidth",
        h: "itemHeight",
        bg: "backgroundColor",
    }
    const cssClasses: CssStyles = {}
    console.log("tailwindclass", classNames)
    let splitClassNames = classNames.split(" ")
    for (let i = 0; i < splitClassNames.length; i++) {
        let item = splitClassNames[i].split("-")
        if (item[0] in tailwindToInfoMappings && item[1]) {
            if (isInt(item[1])) {
                cssClasses[tailwindToInfoMappings[item[0]]] = parseInt(item[1])
            } else {
                cssClasses[tailwindToInfoMappings[item[0]]] = item[1]
            }
        }
    }
    console.log("cssClasses got", cssClasses)

    return cssClasses
}

const calculateStartingHeight = (parentId: string | null, itemIndex: number, allElements: AllElements) => {
    if (!parentId) throw new Error(`parentId must be string, got ${parentId}`)
    let minHeight = 0
    for (let i = 0; i < itemIndex; i++) {
        minHeight += allElements[allElements[parentId].children[i]].info.itemHeight
    }
    return minHeight
}
function processChildNodes(childNodes: Ast[], parentId: string, elements: AllElements, offset: number) {
    let text = ""
    let childrenIds: string[] = []
    let totalHeight = offset

    childNodes.forEach((child) => {
        const [updatedElements, childId, , h] = addElementRecursively(child, parentId, elements, 1, totalHeight)
        totalHeight += h
        Object.assign(elements, updatedElements)
        childrenIds.push(childId)
    })

    return { text, childrenIds, totalHeight }
}
