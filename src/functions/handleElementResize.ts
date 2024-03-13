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
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements,
    setCursorType: SetCursorType
) {
    if (gridMoving.id === null) throw new Error("gridMoving id cant be null")
    if (!allElements[gridMoving.id].parent) throw new Error("parent id cant be null")
    let element = allElements[gridMoving.id]
    if (!element.parent) throw new Error("parent id cant be null")
    let parentInfo = allElements[element.parent].info
    let { top, left, itemWidth, itemHeight, backgroundColor } = allElements[gridMoving.id].info
    let deltaX = (gridMoving.x2 - gridMoving.x1) / gridPixelSize
    let deltaY = (gridMoving.y2 - gridMoving.y1) / gridPixelSize
    console.log("parentInfo.content", parentInfo.contentHeight, parentInfo.contentWidth)
    // Handle creating and resizing-1
    if (gridMoving.type === "creating") {
        itemWidth += deltaX
        itemHeight += deltaY
    } else if (gridMoving.type === "resizing-1") {
        top += deltaY
        itemHeight -= deltaY
        left += deltaX
        itemWidth -= deltaX
    }
    // Implement resizing for the rest of the directions
    else if (gridMoving.type === "resizing-5") {
        top += deltaY
        itemHeight -= deltaY
    } else if (gridMoving.type === "resizing-2") {
        top += deltaY
        itemHeight -= deltaY
        itemWidth += deltaX
    } else if (gridMoving.type === "resizing-6") {
        itemWidth += deltaX
    } else if (gridMoving.type === "resizing-3") {
        itemWidth += deltaX
        itemHeight += deltaY
    } else if (gridMoving.type === "resizing-7") {
        itemHeight += deltaY
    } else if (gridMoving.type === "resizing-4") {
        left += deltaX
        itemWidth -= deltaX
        itemHeight += deltaY
    } else if (gridMoving.type === "resizing-8") {
        left += deltaX
        itemWidth -= deltaX
    }
    itemWidth = Math.round(itemWidth * 100) / 100
    itemWidth = Math.round(itemWidth * 100) / 100
    top = Math.round(top * 100) / 100
    left = Math.round(left * 100) / 100
    if (left < 0) {
        itemWidth += left
        left = 0
    }
    if (top < 0) {
        itemHeight += top
        top = 0
    }
    // Ensuring the element does not extend outside the parent's dimensions
    if (left + itemWidth > parentInfo.contentWidth) {
        itemWidth = Math.max(0, parentInfo.contentWidth - left) // Adjust width if extending outside parent's right edge
    }
    if (top + itemHeight > parentInfo.contentHeight) {
        itemHeight = Math.max(0, parentInfo.contentHeight - top) // Adjust height if extending outside parent's bottom edge
    }
    // Prevent negative dimensions
    let newStyle = calculateNewStyle(left, top, itemWidth, itemHeight, gridPixelSize, backgroundColor)

    if (gridMoving.moved === true) {
        if (itemHeight < 0) {
            top += itemHeight
            itemHeight *= -1
        }
        if (itemWidth < 0) {
            left += itemWidth
            itemWidth *= -1
        }

        newStyle = calculateNewStyle(left, top, itemWidth, itemHeight, gridPixelSize, backgroundColor)
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
                        itemHeight: itemHeight,
                        itemWidth: itemWidth,
                        contentWidth:
                            itemWidth -
                            element.info.border.borderLeft.borderWidth -
                            element.info.border.borderRight.borderWidth -
                            element.info.padding.left -
                            element.info.padding.right,
                        contentHeight:
                            itemHeight -
                            element.info.border.borderTop.borderWidth -
                            element.info.border.borderBottom.borderWidth -
                            element.info.padding.top -
                            element.info.padding.bottom,
                        backgroundColor,
                        top,
                        left,
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
                    itemHeight: itemHeight,
                    itemWidth: itemWidth,
                    contentWidth:
                        itemWidth -
                        element.info.border.borderLeft.borderWidth -
                        element.info.border.borderRight.borderWidth -
                        element.info.padding.left -
                        element.info.padding.right,
                    contentHeight:
                        itemHeight -
                        element.info.border.borderTop.borderWidth -
                        element.info.border.borderBottom.borderWidth -
                        element.info.padding.top -
                        element.info.padding.bottom,
                    top,
                    left,
                }
            }
        })
    )

    setGridMoving((i) => ({ ...i, setBox: true }))
}
