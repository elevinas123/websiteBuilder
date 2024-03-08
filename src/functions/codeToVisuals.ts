import { AllElements, SetAllElements, Style } from "../Types"
import { v4 as uuidv4 } from "uuid"
import { createNewGrid } from "./gridCRUD"
import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import { Change, ChangeDetails, Modify } from "../MarkdownScreen"
import { Ast } from "./parseHTML"
export const updateAllElements = (changes: Modify[], allElements: AllElements, gridPixelSize: number, setAllElements: SetAllElements) => {
    setAllElements(
        produce(allElements, (draft) => {
            changes.forEach(({ action, visualId, change: changeDetails, parentId, newPlace }) => {
                if (!parentId) throw new Error(`parentId must be string, got ${parentId}`)
                if (!visualId) throw new Error(`visualId must be string, got ${visualId}`)
                if (action === "add") {
                    // Adjusted to use draft directly
                    handleElementAddition(changeDetails.changed, parentId, draft, draft)
                } else if (action === "modify") {
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

const handleElementAddition = (changeDetails: Change, parentId: string | null, allElements: AllElements, draft: AllElements) => {
    if (!parentId) throw new Error(`parentId must be string, got ${parentId}`)
    if (!changeDetails) throw new Error(`parentId must be string, got ${parentId}`)
    if (!(changeDetails[0] && isAst(changeDetails[0]))) throw new Error("changeDetails cant be non ast type")
    let elementsIds = []
    let totalHeight = calculateStartingHeight(parentId, 0, allElements) + 1 // +1 to start from the next possible height

    // Directly use `addElementRecursively` to modify the draft
    const [, childId, , h] = addElementRecursively(changeDetails[0], parentId, draft, 1, totalHeight)
    elementsIds.push(childId)
    totalHeight += h
    draft[parentId].children.push(childId)

    return { draft, elementsIds, totalHeight } // Return draft for clarity, even though it's modified in place
}
const handleElementModify = (changeDetails: ChangeDetails, newPlace: string, id: string, draft: AllElements, gridPixelSize: number) => {
    const element = draft[id]
    if (!element) return // Early return if the element doesn't exist

    if (changeDetails.place === "classname") {
        const cssClasses = tailwindClassToCSS(changeDetails.changed[1])
        let width: number = parseInt(cssClasses.width) || element.info.width
        let height: number = parseInt(cssClasses.height) || element.info.height
        let backgroundColor = cssClasses.bg || element.info.backgroundColor
        element.info = {
            ...element.info,
            width,
            height,
            backgroundColor,
        }
        // Apply new styles calculated based on potential changes
        const newStyles = calculateNewStyle(element.info.left, element.info.top, width, height, gridPixelSize, backgroundColor)
        element.style = { ...element.style, ...newStyles }
    } else if (changeDetails.place === "text" && typeof changeDetails.changed[1] === "string") {
        element.text = changeDetails.changed[1]
    } else if (changeDetails.place === "tagName") {
        //I will add tag functionality later
    }

    return
}

export interface CssStyles {
    [s: string]: string
}

const tailwindClassToCSS = (classNames: unknown) => {
    const unitToPx = (unit: number) => `${unit * 4}px` // Ensure the unit is a string with px for CSS

    const colorMappings: { [key: string]: string } = {
        "red-500": "#f56565", // Example color mapping
        // Additional color mappings as needed
    }

    const regex = /^([a-z]+(?:-[a-z]+)*?)-(\d+|[a-z]+\-\d+)$/
    let styles: CssStyles = {}
    if (typeof classNames === "string") {
        classNames.split(" ").forEach((className) => {
            const match = className.match(regex)
            if (!match) return

            const [, type, value] = match
            if (type.startsWith("bg") && colorMappings[value]) {
                styles["backgroundColor"] = colorMappings[value]
                return
            }

            // Numeric values handling
            if (!value) {
                const cssValue = unitToPx(parseInt(value))
                const mappings = {
                    w: "width",
                    h: "height",
                    // Add more mappings as needed
                }

                Object.entries(mappings).forEach(([key, cssProperty]) => {
                    if (type.startsWith(key)) {
                        styles[cssProperty] = cssValue
                    }
                })
            }
        })
    }

    return styles
}

const calculateStartingHeight = (parentId: string | null, itemIndex: number, allElements: AllElements) => {
    if (!parentId) throw new Error(`parentId must be string, got ${parentId}`)
    let minHeight = 0
    for (let i = 0; i < itemIndex; i++) {
        minHeight += allElements[allElements[parentId].children[i]].info.height
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
