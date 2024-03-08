import { AllElements, SetAllElements } from "../../Types"
import calculateNewStyle from "../calculateNewStyle"



export default function justifyLeft(parentId: string, allElements: AllElements, setAllElements: SetAllElements, gridPixelSize: number) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position to maintain their relative order
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].info.left - allElements[b].info.left)

    // Calculate the total width of all children
    const childrenWidths = sortedChildren.map((childId) => allElements[childId].info.width)
    const totalChildrenWidth = childrenWidths.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    // Calculate starting left position for the first child based on the total width
    let accumulatedWidth = parentElement.info.width - totalChildrenWidth // Start from the right, without grid size adjustments

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId) => {
        const child = updatedElements[childId]

        // Update left position for each child based on the accumulatedWidth
        const newStyle = calculateNewStyle(accumulatedWidth, child.info.top, child.info.width, child.info.height, gridPixelSize, child.info.backgroundColor)

        updatedElements[childId] = {
            ...child,
            info: {
                ...child.info,
                left: accumulatedWidth,
            },
            style: {
                ...child.style,
                ...newStyle,
            },
        }

        // Increment accumulatedWidth for the next child's position
        accumulatedWidth += child.info.width
    })
    updatedElements[parentId] = {
        ...updatedElements[parentId],
        info: {
            ...updatedElements[parentId].info,
            justify: "right",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
