import { produce } from "immer"
import calculateMovement from "./calculateMovement"
import calculateNewStyle from "./calculateNewStyle"

export default function handleGridMove(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements) {
    let top = allElements[gridMoving.id].top
    let left = allElements[gridMoving.id].left
    const width = allElements[gridMoving.id].width
    const height = allElements[gridMoving.id].height

    // Calculate new positions and round them to the nearest whole number
    let newLeft = Math.round((left + (gridMoving.x2 - gridMoving.x1) / gridPixelSize) * 100) / 100
    let newTop = Math.round((top + (gridMoving.y2 - gridMoving.y1) / gridPixelSize) * 100) / 100

    const parentId = allElements[gridMoving.id].parent
    const parentInfo = {
        top: allElements[parentId].top,
        left: allElements[parentId].left,
        width: allElements[parentId].width,
        height: allElements[parentId].height,
    }

    // Adjust positions to ensure the moved element remains within its parent's bounds
    if (newTop + height > parentInfo.height) {
        newTop = parentInfo.height - height
    }
    if (newTop < 0) {
        newTop = 0
    }
    if (newLeft + width > parentInfo.width) {
        newLeft = parentInfo.width - width
    }
    if (newLeft < 0) {
        newLeft = 0
    }

    const newStyle = calculateNewStyle(newLeft, newTop, width, height, gridPixelSize)

    // Update elements' positions and styles
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[gridMoving.id]
            if (element) {
                element.top = newTop
                element.left = newLeft
                element.style = {
                    ...element.style,
                    ...newStyle,
                }
            }
        })
    )

    // Reset moving state if the move is completed
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        HistoryClass.performAction(allElements)
        console.log(HistoryClass.currentNode)
        return
    }
    // Continue moving
    setGridMoving((i) => ({ ...i, setBox: true }))
}
