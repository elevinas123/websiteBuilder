import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"

export default function handlePaddingResize(gridMoving, allElements, gridPixelSize, setGridMoving, setAllElements, setCursorType) {
    let { top, left, right, bottom } = allElements[gridMoving.id].padding
    let deltaX = (gridMoving.x2 - gridMoving.x1) / gridPixelSize
    let deltaY = (gridMoving.y2 - gridMoving.y1) / gridPixelSize

    if (gridMoving.type === "padding-top") {
        top += deltaY
        // Prevent top padding from extending past the bottom padding
        if (top + bottom > allElements[gridMoving.id].height) {
            top = allElements[gridMoving.id].height - bottom
        }
    } else if (gridMoving.type === "padding-right") {
        right -= deltaX // Assuming this should be deltaX instead of deltaY
    } else if (gridMoving.type === "padding-bottom") {
        bottom -= deltaY
        // Prevent bottom padding from extending past the top padding
        if (top + bottom > allElements[gridMoving.id].height) {
            bottom = allElements[gridMoving.id].height - top
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
            padding: {
                top,
                left,
                bottom,
                right,
            },
        },
    }))
    if (gridMoving.moved) {
        setGridMoving({ moving: false })
        return
    }

    setGridMoving((i) => ({ ...i, setBox: true }))
    return
}
