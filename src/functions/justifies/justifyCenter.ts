import { AllElements, SetAllElements } from "../../Types"
import calculateNewStyle from "../calculateNewStyle"

export default function justifyCenter(parentId: string, allElements:  AllElements, setAllElements: SetAllElements, gridPixelSize: number) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].info.left - allElements[b].info.left)

    // Calculate the total width of all children
    const childrenWidths = sortedChildren.map((childId) => allElements[childId].info.width)
    const totalChildrenWidth = childrenWidths.reduce((accumulator, currentValue) => accumulator + currentValue, 1)

    // Calculate the total spacing and the space on each side
    const totalSpacing = parentElement.info.width - totalChildrenWidth
    const spaceOnEachSide = totalSpacing / 2

    let accumulatedWidth = spaceOnEachSide // Start from the left space

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId, index) => {
        // Update left position for each child based on the accumulatedWidth
        const newStyle = calculateNewStyle(
            accumulatedWidth,
            updatedElements[childId].info.top,
            updatedElements[childId].info.width,
            updatedElements[childId].info.height,
            gridPixelSize,
            updatedElements[childId].info.backgroundColor
        )
        updatedElements[childId] = {
            ...updatedElements[childId],
            info: {
                ...updatedElements[childId].info,
                left: accumulatedWidth,
            },
            style: {
                ...updatedElements[childId].style,
                ...newStyle,
            },
        }

        // Add the current child's width to the accumulatedWidth for the next child's position
        accumulatedWidth += childrenWidths[index] - 1
    })
    updatedElements[parentId] = {
        ...updatedElements[parentId],
        info: {
            ...updatedElements[parentId].info,
            justify: "justifyCenter",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
