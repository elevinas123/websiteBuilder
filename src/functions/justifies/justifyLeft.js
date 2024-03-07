import calculateNewStyle from "../calculateNewStyle"

export default function justifyLeft(parentId, allElements, setAllElements, gridPixelSize) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].info.left - allElements[b].info.left)

    let accumulatedWidth = 1 // Start from the left edge of the parent

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId, index) => {
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
                left: accumulatedWidth
            },
            style: {
                ...updatedElements[childId].style,
                ...newStyle,
            },
        }

        // Add the current child's width to the accumulatedWidth for the next child's position
        accumulatedWidth += updatedElements[childId].width -1 
    })
    updatedElements[parentId] = {
        ...updatedElements[parentId],
        info: {
            ...updatedElements[parentId].info,
            justify: "justifyLeft",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
