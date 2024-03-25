import { AllElements, SetAllElements } from "../../Types"
import calculateNewStyle from "../calculateNewStyle"

export default function justifyCenter(parentId: string, allElements: AllElements, setAllElements: SetAllElements, gridPixelSize: number) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position to maintain their visual order
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].info.left - allElements[b].info.left)

    // Calculate the total width of all children including their margins
    const totalChildrenWidthWithMargins = sortedChildren.reduce((total, childId) => {
        const { itemWidth, margin } = allElements[childId].info
        return total + itemWidth + margin.left + margin.right
    }, 0)

    // Calculate the available space by subtracting the total children width from the parent's width
    const availableSpace = parentElement.info.contentWidth - totalChildrenWidthWithMargins

    // Calculate the spacing between elements
    const gaps = Math.max(sortedChildren.length - 1, 1) // Ensure there's at least one gap to avoid division by zero
    const spaceBetween = availableSpace / gaps

    let accumulatedWidth = 1 // Start with half of spaceBetween to center-align the group of elements within the parent

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId, index) => {
        const { itemWidth, top, margin } = updatedElements[childId].info

        // For each child, set the new left position based on the accumulatedWidth and include left margin
        const newStyle = calculateNewStyle(
            accumulatedWidth + margin.left,
            top + margin.top,
            itemWidth,
            updatedElements[childId].info.itemHeight,
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

        // Update accumulatedWidth for the next child's position, include the child's width and its margins
        accumulatedWidth += itemWidth + margin.left + margin.right + spaceBetween
    })

    updatedElements[parentId] = {
        ...updatedElements[parentId],
        info: {
            ...updatedElements[parentId].info,
            justify: "spaceBetween",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
