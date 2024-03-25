import { AllElements, SetAllElements } from "../../Types"
import calculateNewStyle from "../calculateNewStyle"

export default function justifyLeft(parentId: string, allElements: AllElements, setAllElements: SetAllElements, gridPixelSize: number) {
    const parentElement = allElements[parentId]

    // Sort children by their current left position
    const sortedChildren = [...parentElement.children].sort((a, b) => allElements[a].info.left - allElements[b].info.left)

    let accumulatedWidth = 1 // Start from the left edge of the parent, assuming starting at 1 means starting at the very beginning

    // Prepare updated elements with new positions
    const updatedElements = { ...allElements }
    sortedChildren.forEach((childId) => {
        const child = updatedElements[childId]
        const childMarginLeft = child.info.margin.left // Assuming margin left is defined in your info object
        const childMarginRight = child.info.margin.right // Assuming margin right is defined in your info object

        const newStyle = calculateNewStyle(
            accumulatedWidth + childMarginLeft, // Incorporate marginLeft into the position
            child.info.top + child.info.margin.top, // Assuming margin top is also to be considered
            child.info.itemWidth,
            child.info.itemHeight,
            gridPixelSize,
            child.info.backgroundColor
        )

        updatedElements[childId] = {
            ...child,
            info: {
                ...child.info,
                left: accumulatedWidth, // Update left position including margin
            },
            style: {
                ...child.style,
                ...newStyle,
            },
        }

        // Add the current child's width and its margins to the accumulatedWidth for the next child's position
        accumulatedWidth += child.info.itemWidth + childMarginLeft + childMarginRight
    })

    updatedElements[parentId] = {
        ...updatedElements[parentId],
        info: {
            ...updatedElements[parentId].info,
            justify: "left", // Make sure the justification is set correctly according to your needs
        },
    }

    // Update the state with the new elements
    setAllElements(updatedElements)
}
