import calculateNewStyle from "../calculateNewStyle"

export default function justifyLeft(parentId, allElements, setAllElements, gridPixelSize) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].left - allElements[b].left)

    let accumulatedWidth = 1 // Start from the left edge of the parent

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId, index) => {
        const newStyle = calculateNewStyle(
            accumulatedWidth,
            updatedElements[childId].top,
            updatedElements[childId].width,
            updatedElements[childId].height,
            gridPixelSize
        )
        updatedElements[childId] = {
            ...updatedElements[childId],
            left: accumulatedWidth,
            style: {
                ...updatedElements[childId].style,
                ...newStyle,
            },
        }

        // Add the current child's width to the accumulatedWidth for the next child's position
        accumulatedWidth += updatedElements[childId].width -1 
    })

    // Update the state with the new elements
    setAllElements(updatedElements)
}
