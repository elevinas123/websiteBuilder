import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import { AllElements, SetAllElements } from "../Types"
import { GridMoving, SetGridMoving } from "../atoms"
import UndoTree from "../UndoTree"

export default function handlePaddingResize(
    gridMoving: GridMoving,
    allElements: AllElements,
    gridPixelSize: number,
    HistoryClass: UndoTree<AllElements>,
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements
) {
    let { top, left, right, bottom } = allElements[gridMoving.id].info.padding
    let deltaX = (gridMoving.x2 - gridMoving.x1) / gridPixelSize
    let deltaY = (gridMoving.y2 - gridMoving.y1) / gridPixelSize

    if (gridMoving.type === "padding-top") {
        top += deltaY
        // Prevent top padding from extending past the bottom padding
        if (top + bottom > allElements[gridMoving.id].info.itemHeight) {
            top = allElements[gridMoving.id].info.itemHeight - bottom
        }
    } else if (gridMoving.type === "padding-right") {
        right -= deltaX // Assuming this should be deltaX instead of deltaY
    } else if (gridMoving.type === "padding-bottom") {
        bottom -= deltaY
        // Prevent bottom padding from extending past the top padding
        if (top + bottom > allElements[gridMoving.id].info.itemHeight) {
            bottom = allElements[gridMoving.id].info.itemHeight - top
        }
    } else if (gridMoving.type === "padding-left") {
        left += deltaX
    }

    // Ensure padding values do not go negative
    top = Math.max(top, 0)
    left = Math.max(left, 0)
    bottom = Math.max(bottom, 0)
    right = Math.max(right, 0)

    setAllElements((elements) => ({
        ...elements,
        [gridMoving.id]: {
            ...elements[gridMoving.id],
            style: {
                ...elements[gridMoving.id].style,
                paddingLeft: left * gridPixelSize,
                paddingRight: right * gridPixelSize,
                paddingTop: top * gridPixelSize,
                paddingBottom: bottom * gridPixelSize,
            },
            info: {
                ...elements[gridMoving.id].info,
                contentHeight:
                    elements[gridMoving.id].info.itemHeight -
                    top -
                    bottom -
                    elements[gridMoving.id].info.border.borderTop.borderWidth -
                    elements[gridMoving.id].info.border.borderBottom.borderWidth,
                contentWidth:
                    elements[gridMoving.id].info.itemWidth -
                    left -
                    right -
                    elements[gridMoving.id].info.border.borderLeft.borderWidth -
                    elements[gridMoving.id].info.border.borderRight.borderWidth,
                padding: {
                    top,
                    left,
                    bottom,
                    right,
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
