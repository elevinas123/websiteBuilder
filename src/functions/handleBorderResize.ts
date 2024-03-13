import { AllElements, SetAllElements } from "../Types"
import { GridMoving, SetGridMoving } from "../atoms"
import UndoTree from "../UndoTree"

export default function handleBorderResize(
    gridMoving: GridMoving,
    allElements: AllElements,
    gridPixelSize: number,
    HistoryClass: UndoTree<AllElements>,
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements
) {
    // Access the current border widths
    let borderTopWidth = allElements[gridMoving.id].info.border.borderTop.borderWidth
    let borderRightWidth = allElements[gridMoving.id].info.border.borderRight.borderWidth
    let borderBottomWidth = allElements[gridMoving.id].info.border.borderBottom.borderWidth
    let borderLeftWidth = allElements[gridMoving.id].info.border.borderLeft.borderWidth

    let deltaX = (gridMoving.x2 - gridMoving.x1) / gridPixelSize
    let deltaY = (gridMoving.y2 - gridMoving.y1) / gridPixelSize

    if (gridMoving.type === "padding-top") {
        borderTopWidth += deltaY
        // Prevent border width from becoming too large
        if (borderTopWidth + borderBottomWidth > allElements[gridMoving.id].info.itemHeight) {
            borderTopWidth = allElements[gridMoving.id].info.itemHeight - borderBottomWidth
        }
    } else if (gridMoving.type === "padding-right") {
        borderRightWidth -= deltaX
    } else if (gridMoving.type === "padding-bottom") {
        borderBottomWidth -= deltaY
        if (borderTopWidth + borderBottomWidth > allElements[gridMoving.id].info.itemHeight) {
            borderBottomWidth = allElements[gridMoving.id].info.itemHeight - borderTopWidth
        }
    } else if (gridMoving.type === "padding-left") {
        borderLeftWidth += deltaX
    }

    // Ensure border widths do not go negative
    borderTopWidth = Math.max(borderTopWidth, 0)
    borderRightWidth = Math.max(borderRightWidth, 0)
    borderBottomWidth = Math.max(borderBottomWidth, 0)
    borderLeftWidth = Math.max(borderLeftWidth, 0)

    // Update the element with the new border widths
    setAllElements((elements) => ({
        ...elements,
        [gridMoving.id]: {
            ...elements[gridMoving.id],
            style: {
                ...elements[gridMoving.id].style,
                borderTopWidth: borderTopWidth * gridPixelSize,
                borderRightWidth: borderRightWidth * gridPixelSize,
                borderBottomWidth: borderBottomWidth * gridPixelSize,
                borderLeftWidth: borderLeftWidth * gridPixelSize,
            },
            info: {
                ...elements[gridMoving.id].info,
                border: {
                    borderTop: { borderWidth: borderTopWidth, borderColor: elements[gridMoving.id].info.border.borderTop.borderColor },
                    borderRight: { borderWidth: borderRightWidth, borderColor: elements[gridMoving.id].info.border.borderRight.borderColor },
                    borderBottom: { borderWidth: borderBottomWidth, borderColor: elements[gridMoving.id].info.border.borderBottom.borderColor },
                    borderLeft: { borderWidth: borderLeftWidth, borderColor: elements[gridMoving.id].info.border.borderLeft.borderColor },
                },
            },
        },
    }))

    if (gridMoving.moved) {
        setGridMoving((i) => ({ ...i, moving: false }))
        HistoryClass.performAction(allElements)
        console.log(HistoryClass.currentNode)
        return
    }

    setGridMoving((i) => ({ ...i, setBox: true }))
    return
}
