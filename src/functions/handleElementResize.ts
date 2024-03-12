import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import { GridMoving, SetCursorType, SetGridMoving } from "../atoms"
import { AllElements, SetAllElements } from "../Types"
import UndoTree from "../UndoTree"

export default function handleElementResize(
    gridMoving: GridMoving,
    allElements: AllElements,
    gridPixelSize: number,
    HistoryClass: UndoTree<AllElements>,
    setGridMoving: SetGridMoving ,
    setAllElements: SetAllElements,
    setCursorType: SetCursorType,
) {
    if (gridMoving.id === null) throw new Error("gridMoving id cant be null")
    if (!allElements[gridMoving.id].parent) throw new Error("parent id cant be null")
    let element = allElements[gridMoving.id]
    if (!element.parent)throw new Error("parent id cant be null")
    let parentInfo = allElements[element.parent].info
    let { top, left, width, height, backgroundColor } = allElements[gridMoving.id].info
    let deltaX = (gridMoving.x2 - gridMoving.x1) / gridPixelSize
    let deltaY = (gridMoving.y2 - gridMoving.y1) / gridPixelSize
    // Handle creating and resizing-1
    if (gridMoving.type === "creating") {
        width += deltaX
        height += deltaY
    } else if (gridMoving.type === "resizing-1") {
        top += deltaY
        height -= deltaY
        left += deltaX
        width -= deltaX
    }
    // Implement resizing for the rest of the directions
    else if (gridMoving.type === "resizing-5") {
        top += deltaY
        height -= deltaY
    } else if (gridMoving.type === "resizing-2") {
        top += deltaY
        height -= deltaY
        width += deltaX
    } else if (gridMoving.type === "resizing-6") {
        width += deltaX
    } else if (gridMoving.type === "resizing-3") {
        width += deltaX
        height += deltaY
    } else if (gridMoving.type === "resizing-7") {
        height += deltaY
    } else if (gridMoving.type === "resizing-4") {
        left += deltaX
        width -= deltaX
        height += deltaY
    } else if (gridMoving.type === "resizing-8") {
        left += deltaX
        width -= deltaX
    }
    width = Math.round(width * 100) / 100
    height = Math.round(height * 100) / 100
    top = Math.round(top * 100) / 100
    left = Math.round(left * 100) / 100
    if (left < 0) {
        width += left
        left = 0
    }
    if (top < 0) {
        height += top
        top = 0
    }
    // Ensuring the element does not extend outside the parent's dimensions
    if (left + width > parentInfo.width) {
        width = Math.max(0, parentInfo.width - left) // Adjust width if extending outside parent's right edge
    }
    if (top + height > parentInfo.height) {
        height = Math.max(0, parentInfo.height - top) // Adjust height if extending outside parent's bottom edge
    }
    // Prevent negative dimensions
    let newStyle = calculateNewStyle(left, top, width, height, gridPixelSize, backgroundColor)

    if (gridMoving.moved === true) {
        if (height < 0) {
            top += height
            height *= -1
        }
        if (width < 0) {
            left += width
            width *= -1
        }

        newStyle = calculateNewStyle(left, top, width, height, gridPixelSize, backgroundColor)
        setAllElements((currentState) =>
            produce(currentState, (draft) => {
                const element = draft[gridMoving.id]
                if (element) {
                    element.style = {
                        ...element.style,
                        ...newStyle,
                    }
                    element.info = {
                        ...element.info,
                        height,
                        width,
                        top,
                        left
                    }
                }
            })
        )
        setGridMoving((i) => ({ ...i, moving: false }))
        HistoryClass.performAction(allElements)
        console.log(HistoryClass.currentNode)
        if (gridMoving.type === "creating") {
            setCursorType("moving")
        }
        return
    }
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[gridMoving.id]
            if (element) {
                element.style = {
                    ...element.style,
                    ...newStyle,
                }
                element.info = {
                    ...element.info,
                    height,
                    width,
                    top,
                    left,
                }
            }
        })
    )

    setGridMoving((i) => ({ ...i, setBox: true }))
}
