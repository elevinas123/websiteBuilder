import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import { GridMoving, SetGridMoving } from "./../atoms"
import { AllElements, SetAllElements } from "../Types"
import UndoTree from "../UndoTree"

export default function handleGridMove(
    gridMoving: GridMoving,
    allElements: AllElements,
    gridPixelSize: number,
    HistoryClass: UndoTree<AllElements>,
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements
) {
    let elementInfo = allElements[gridMoving.id].info
    let top = elementInfo.margin.top
    let left = elementInfo.margin.left
    let bottom = elementInfo.margin.bottom
    let right = elementInfo.margin.right
    const width = elementInfo.itemWidth
    const height = elementInfo.itemHeight
    const backgroundColor = elementInfo.backgroundColor

    // Calculate new positions and round them to the nearest whole number
    let newLeft = Math.round((left + (gridMoving.x2 - gridMoving.x1) / gridPixelSize) * 100) / 100
    let newTop = Math.round((top + (gridMoving.y2 - gridMoving.y1) / gridPixelSize) * 100) / 100
    let borderLeft = elementInfo.border.borderLeft.borderWidth
    let borderTop = elementInfo.border.borderTop.borderWidth
    let borderBottom = elementInfo.border.borderBottom.borderWidth
    let borderRight = elementInfo.border.borderRight.borderWidth

    const parentId = allElements[gridMoving.id].parent
    if (!parentId) throw new Error("parentId must be a string when moving elements")
    const parentInfo = {
        top: allElements[parentId].info.top,
        left: allElements[parentId].info.left,
        width: allElements[parentId].info.contentWidth,
        height: allElements[parentId].info.contentHeight,
    }
    let nextElementIndex = allElements[parentId].children.indexOf(gridMoving.id) + 1
    if (allElements[parentId].children.length > nextElementIndex) {
        const nextElementInfo = allElements[allElements[parentId].children[nextElementIndex]].info
        if (elementInfo.top + newTop + height + borderTop + borderBottom > parentInfo.height) {
            newTop = top
        }
        if (elementInfo.left + newLeft + width + borderLeft + borderRight > nextElementInfo.left) {
            newLeft = left
        }
    } else {
        if (elementInfo.top + newTop + height + borderTop + borderBottom > parentInfo.height) {
            newTop = top
        }
        if (elementInfo.left + newLeft + width + borderLeft + borderRight > parentInfo.width) {
            newLeft = left
        }
    }
    // Adjust positions to ensure the moved element remains within its parent's bounds
    if (newTop < 0) {
        newTop = 0
    }
    if (newLeft < 0) {
        newLeft = 0
    }
    let offsetConfig = {
        offset: gridMoving.offset,
        offsetLeft: gridMoving.offsetLeft,
        offsetTop: gridMoving.offsetTop,
    }
    let newStyle = calculateNewStyle(newLeft + elementInfo.left, newTop + elementInfo.top, width, height, gridPixelSize, backgroundColor)
    console.log("gridMoving", gridMoving)

    console.log(allElements[parentId].children.indexOf(gridMoving.id) + 1, allElements[parentId].children.length)
    if (allElements[parentId].children.indexOf(gridMoving.id) + 1 < allElements[parentId].children.length) {
        const nextChild = allElements[allElements[parentId].children[allElements[parentId].children.indexOf(gridMoving.id) + 1]].info
        right = nextChild.left - elementInfo.left - newLeft - width - borderLeft - borderRight
        bottom = nextChild.top - elementInfo.top - newTop - height - borderTop - borderBottom
    }

    // Update elements' positions and styles
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[gridMoving.id]
            if (element) {
                element.info = {
                    ...element.info,
                    margin: {
                        ...element.info.margin,
                        top: newTop,
                        left: newLeft,
                        bottom: bottom,
                        right: right,
                    },
                }
                element.style = {
                    ...element.style,
                    ...newStyle,
                }
            }
        })
    )

    // Reset moving state if the move is completed
    if (gridMoving.moved === true) {
        setGridMoving((i) => ({ ...i, moving: false }))
        HistoryClass.performAction(allElements)

        return
    }
    // Continue moving
    setGridMoving((i) => ({ ...i, setBox: true, ...offsetConfig }))
}
