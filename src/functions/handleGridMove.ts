import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import { GridMoving, SetGridMoving } from "./../atoms"
import { AllElements, SetAllElements } from "../Types";
import UndoTree from "../UndoTree";

export default function handleGridMove(
    gridMoving: GridMoving,
    allElements: AllElements,
    gridPixelSize: number,
    HistoryClass: UndoTree<AllElements>,
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements,
) {
    let top = allElements[gridMoving.id].info.top
    let left = allElements[gridMoving.id].info.left
    const width = allElements[gridMoving.id].info.width
    const height = allElements[gridMoving.id].info.height
    const backgroundColor = allElements[gridMoving.id].info.backgroundColor

    // Calculate new positions and round them to the nearest whole number
    let newLeft = Math.round((left + (gridMoving.x2 - gridMoving.x1) / gridPixelSize) * 100) / 100
    let newTop = Math.round((top + (gridMoving.y2 - gridMoving.y1) / gridPixelSize) * 100) / 100
    let borderLeft = allElements[gridMoving.id].info.border.borderLeft.borderWidth
    let borderTop = allElements[gridMoving.id].info.border.borderTop.borderWidth

    const parentId = allElements[gridMoving.id].parent
    if (!parentId) throw new Error("parentId must be a string when moving elements")
    const parentInfo = {
        top: allElements[parentId].info.top,
        left: allElements[parentId].info.left,
        width: allElements[parentId].info.width,
        height: allElements[parentId].info.height,
    }

    // Adjust positions to ensure the moved element remains within its parent's bounds
    if (newTop + height + borderTop > parentInfo.height) {
        newTop = parentInfo.height - height
    }
    if (newTop < 0) {
        newTop = 0
    }
    if (newLeft + width + borderLeft > parentInfo.width) {
        newLeft = parentInfo.width - width
    }
    if (newLeft < 0) {
        newLeft = 0
    }
    let offsetConfig = {
        offset: gridMoving.offset,
        offsetLeft: gridMoving.offsetLeft,
        offsetTop: gridMoving.offsetTop,
    }
    let newStyle = calculateNewStyle(newLeft, newTop, width, height, gridPixelSize, backgroundColor)
    console.log("gridMoving", gridMoving)


    

    // Update elements' positions and styles
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[gridMoving.id]
            if (element) {
                element.info = {
                    ...element.info,
                    top: newTop,
                    left: newLeft
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
        setGridMoving(i => ({...i, moving: false }))
        HistoryClass.performAction(allElements)

        return
    }
    // Continue moving
    setGridMoving((i) => ({ ...i, setBox: true, ...offsetConfig }))
}
