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
    let elementInfo = allElements[gridMoving.id].info
    let top = elementInfo.margin.top
    let left =  elementInfo.margin.left
    const width = elementInfo.itemWidth
    const height = elementInfo.itemHeight
    const backgroundColor = elementInfo.backgroundColor

    // Calculate new positions and round them to the nearest whole number
    let newLeft = Math.round((left + (gridMoving.x2 - gridMoving.x1) / gridPixelSize) * 100) / 100
    let newTop = Math.round((top + (gridMoving.y2 - gridMoving.y1) / gridPixelSize) * 100) / 100
    let borderLeft = elementInfo.border.borderLeft.borderWidth
    let borderTop = elementInfo.border.borderTop.borderWidth

    const parentId = allElements[gridMoving.id].parent
    if (!parentId) throw new Error("parentId must be a string when moving elements")
    const parentInfo = {
        top: allElements[parentId].info.top,
        left: allElements[parentId].info.left,
        width: allElements[parentId].info.contentWidth,
        height: allElements[parentId].info.contentHeight,
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
    let newStyle = calculateNewStyle(newLeft + elementInfo.left, newTop + elementInfo.top, width, height, gridPixelSize, backgroundColor)
    console.log("gridMoving", gridMoving)


    

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
                    }
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
