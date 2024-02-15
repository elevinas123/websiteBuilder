import calculateNewStyle from "../calculateNewStyle"

export default function justifyBetween(parentId, allElements, setAllElements) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position to maintain their visual order
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].left - allElements[b].left)

    // Calculate the total width of all children
    const childrenWidths = sortedChildren.map((childId) => allElements[childId].width)
    const totalChildrenWidth = childrenWidths.reduce((total, width) => total + width, 0)

    // Calculate the total available space by subtracting the total children width from the parent's width
    const availableSpace = parentElement.width - totalChildrenWidth

    // Calculate the spacing between elements based on the available space and the number of gaps
    // The number of gaps is one less than the number of children
    const spaceBetween = availableSpace / (sortedChildren.length - 1)

    let accumulatedWidth = 1 // Start from the left edge of the parent

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId, index) => {
        const child = updatedElements[childId]

        // For each child, set the new left position based on the accumulatedWidth
        const newStyle = calculateNewStyle(accumulatedWidth, child.top, child.width, child.height)

        updatedElements[childId] = {
            ...child,
            left: accumulatedWidth, // Set new left position
            style: {
                ...child.style,
                ...newStyle,
            },
        }

        // Update accumulatedWidth for the next child's position
        // After positioning each child, add its width and the calculated space between to the accumulated width
        // Except for the last child, which does not need space added after it
        if (index < sortedChildren.length - 1) {
            accumulatedWidth += child.width + spaceBetween
        }
    })

    // Update the state with the new elements
    setAllElements(updatedElements)
}
