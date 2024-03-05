
import calculateNewStyle from "../calculateNewStyle"

export default function justifyRight(parentId, allElements, setAllElements) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position to maintain their relative order
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].left - allElements[b].left)

    // Calculate the total width of all children
    const childrenWidths = sortedChildren.map((childId) => allElements[childId].width)
    const totalChildrenWidth = childrenWidths.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    // Calculate starting left position for the first child based on the total width
    let accumulatedWidth = parentElement.width - totalChildrenWidth // Start from the right, without grid size adjustments

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId) => {
        const child = updatedElements[childId]

        // Update left position for each child based on the accumulatedWidth
        const newStyle = calculateNewStyle(accumulatedWidth, child.top, child.width, child.height, child.style.backgroundColor)

        updatedElements[childId] = {
            ...child,
            left: accumulatedWidth, // Set new left position
            style: {
                ...child.style,
                ...newStyle,
            },
        }

        // Increment accumulatedWidth for the next child's position
        accumulatedWidth += child.width
    })
    updatedElements[parentId] = {
        ...updatedElements[parentId],
        css: {
            ...updatedElements[parentId].css,
            justify: "justify-right",
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
