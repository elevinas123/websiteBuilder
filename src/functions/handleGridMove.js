import { produce } from "immer"
import calculateMovement from "./calculateMovement"
import calculateNewStyle from "./calculateNewStyle"

export default function handleGridMove(gridMoving, allElements, gridPixelSize, setGridMoving, setAllElements) {
    let top = allElements[gridMoving.id].top
    let left = allElements[gridMoving.id].left
    const width = allElements[gridMoving.id].width
    const height = allElements[gridMoving.id].height
    let [newLeft, newtop] = [left + (gridMoving.x2 - gridMoving.x1) / gridPixelSize, top + (gridMoving.y2 - gridMoving.y1) / gridPixelSize]
    const parentId = allElements[gridMoving.id].parent
    const parentInfo = {
        top: allElements[parentId].top,
        left: allElements[parentId].left,
        width: allElements[parentId].width,
        height: allElements[parentId].height,
    }

    if (newtop + height > parentInfo.height) {
        newtop = parentInfo.height - height
    }
    if (newtop < 0) {
        newtop = 0
    }
    if (newLeft + width > parentInfo.width) {
        newLeft = parentInfo.width - width
    }
    if (newLeft < 0) {
        newLeft = 0
    }
    const newStyle = calculateNewStyle(newLeft, newtop, width, height, gridPixelSize)
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            // Update the parent element
            const element = draft[gridMoving.id]
            if (element) {
                element.top = newtop
                element.left = newLeft
                element.style = {
                    ...element.style,
                    ...newStyle,
                }
            }
        })
    )

    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        return
    }
    setGridMoving((i) => ({ ...i, setBox: true }))
}
