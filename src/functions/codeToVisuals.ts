import { AllElements, SetAllElements } from "../Types"
import { v4 as uuidv4 } from "uuid"
import { createNewGrid } from "./gridCRUD"
import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
export const updateAllElements = (changes, allElements: AllElements, gridPixelSize: number, setAllElements: SetAllElements) => {
    setAllElements(
        produce(allElements, (draft) => {
            changes.forEach(({ action, visualId, change: changeDetails, parentId, newPlace }) => {
                if (action === "add" && changeDetails.nodeType !== 3) {
                    // Adjusted to use draft directly
                    handleElementAddition(changeDetails, parentId, draft, draft)
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
const addElementRecursively = (change, parentId: string, draft: AllElements, gridPixelSize: number, offsetLeft = 1, offsetTop = 1) => {
    const newElementId = uuidv4()
    const styles = processStyles(change.attribs)
    const { text, childrenIds, totalHeight } = processChildNodes(change.childNodes || [], newElementId, draft, offsetTop)

    draft[newElementId] = createNewGrid(
        newElementId,
        parentId,
        offsetLeft,
        totalHeight,
        10, // elementWidth,
        10, // elementHeight,
        { top: 0, left: 0, bottom: 0, right: 0 },
        gridPixelSize,
        childrenIds
    )

    return [draft, newElementId, 10 /* elementWidth */, 10 /* elementHeight */]
}
function processStyles(attribs) {
    return Object.entries(attribs || {}).reduce((acc, [attrName, attrValue]) => {
        if (attrName === "class") {
            acc.className = attrValue // Handle class attribute
        }
        return acc
    }, {})
}

const handleElementAddition = (changeDetails, parentId: string, allElements: AllElements, draft) => {
    let elementsIds = []
    let totalHeight = calculateStartingHeight(parentId, 0, allElements) + 1 // +1 to start from the next possible height

    // Directly use `addElementRecursively` to modify the draft
    const [, childId, , h] = addElementRecursively(changeDetails, parentId, draft, 1, totalHeight)
    elementsIds.push(childId)
    totalHeight += h
    draft[parentId].children.push(childId)

    return { draft, elementsIds, totalHeight } // Return draft for clarity, even though it's modified in place
}
const handleElementModify = (changeDetails, newPlace: string, id: string, draft, gridPixelSize: number) => {
    const element = draft[id]
    if (!element) return // Early return if the element doesn't exist

    if (changeDetails.place === "classname") {
        const cssClasses = tailwindClassToCSS(changeDetails.changed[1])
        let width = cssClasses.width || element.width
        let height = cssClasses.height || element.height
        let backgroundColor = cssClasses.bg || element.backgroundColor
        element.info = {
            ...element.info,
            width,
            height,
            backgroundColor,
        }
        // Apply new styles calculated based on potential changes
        const newStyles = calculateNewStyle(element.info.left, element.info.top, width, height, gridPixelSize, height)
        element.style = { ...element.style, ...newStyles }
    } else if (changeDetails.place === "text") {
        element.text = changeDetails.changed[1]
    } else if (changeDetails.place === "tagName") {
        //I will add tag functionality later
    }

    if (newPlace === "attribs") {
        element[changeDetails.place] = changeDetails.changed[1]
    }

    return
}
const tailwindClassToCSS = (classNames) => {
    const unitToPx = (unit) => `${unit * 4}px` // Ensure the unit is a string with px for CSS

    const colorMappings = {
        "red-500": "#f56565", // Example color mapping
        // Additional color mappings as needed
    }

    const regex = /^([a-z]+(?:-[a-z]+)*?)-(\d+|[a-z]+\-\d+)$/
    let styles = {}

    classNames.split(" ").forEach((className) => {
        const match = className.match(regex)
        if (!match) return

        const [, type, value] = match

        if (type.startsWith("bg") && colorMappings[value]) {
            styles["backgroundColor"] = colorMappings[value]
            return
        }

        // Numeric values handling
        if (!isNaN(value)) {
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

    return styles
}

const calculateStartingHeight = (parentId: string, itemIndex: number, allElements: AllElements) => {
    let minHeight = 0
    for (let i = 0; i < itemIndex; i++) {
        minHeight += allElements[allElements[parentId].children[i]].info.height
    }
    return minHeight
}
function processChildNodes(childNodes, parentId: string, elements, offset: number) {
    let text = ""
    let childrenIds: string[] = []
    let totalHeight = offset

    childNodes.forEach((child) => {
        if (child.nodeType === 3) {
            // Text node
            text += child.textContent
            return
        }
        const [updatedElements, childId, , h] = addElementRecursively(child, parentId, elements, 1, totalHeight)
        totalHeight += h
        Object.assign(elements, updatedElements)
        childrenIds.push(childId)
    })

    return { text, childrenIds, totalHeight }
}
