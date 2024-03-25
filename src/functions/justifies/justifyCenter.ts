import { AllElements, SetAllElements } from "../../Types"
import calculateNewStyle from "../calculateNewStyle"

export default function justifyCenter(parentId: string, allElements: AllElements, setAllElements: SetAllElements, gridPixelSize: number) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].info.left - allElements[b].info.left)

    // Calculate the total width of all children including their margins
    const childrenWidthsWithMargins = sortedChildren.map(
        (childId) => allElements[childId].info.itemWidth + allElements[childId].info.margin.left + allElements[childId].info.margin.right
    )
    const totalChildrenWidth = childrenWidthsWithMargins.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    // Calculate the total spacing and the space on each side
    const totalSpacing = parentElement.info.contentWidth - totalChildrenWidth
    const spaceOnEachSide = totalSpacing / 2

    let accumulatedWidth = spaceOnEachSide // Start from the left space

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId) => {
        const child = updatedElements[childId]
        const margin = child.info.margin.left // Assuming the left margin needs to be considered for positioning

        // Update left position for each child based on the accumulatedWidth including margin
        const newStyle = calculateNewStyle(
            accumulatedWidth + margin,
            child.info.top + child.info.margin.top, // Assuming top margin is to be considered
            child.info.itemWidth,
            child.info.itemHeight,
            gridPixelSize,
            child.info.backgroundColor
        )
        updatedElements[childId] = {
            ...child,
            info: {
                ...child.info,
                left: accumulatedWidth, // Include margin in the new left position
            },
            style: {
                ...child.style,
                ...newStyle,
            },
        }

        // Add the current child's width and its margins to the accumulatedWidth for the next child's position
        accumulatedWidth += child.info.itemWidth + child.info.margin.left + child.info.margin.right
    })
    updatedElements[parentId] = {
        ...updatedElements[parentId],
        info: {
            ...updatedElements[parentId].info,
            justify: "center",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
