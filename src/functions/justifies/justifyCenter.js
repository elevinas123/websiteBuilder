import calculateNewStyle from "../calculateNewStyle"

export default function justifyCenter(parentId, allElements, setAllElements, gridPixelSize) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].left - allElements[b].left)

    // Calculate the total width of all children
    const childrenWidths = sortedChildren.map((childId) => allElements[childId].width)
    const totalChildrenWidth = childrenWidths.reduce((accumulator, currentValue) => accumulator + currentValue, 1)

    // Calculate the total spacing and the space on each side
    const totalSpacing = parentElement.width - totalChildrenWidth
    const spaceOnEachSide = totalSpacing / 2

    let accumulatedWidth = spaceOnEachSide // Start from the left space

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId, index) => {
        // Update left position for each child based on the accumulatedWidth
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
        accumulatedWidth += childrenWidths[index]-1
    })
    updatedElements[parentId] = {
        ...updatedElements[parentId],
        css: {
            ...updatedElements[parentId].css,
            justify: "justify-center",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
