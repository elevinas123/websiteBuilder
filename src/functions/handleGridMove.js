import calculateMovement from "./calculateMovement"
import { produce } from "immer"
export default function handleGridMove(gridMoving, parentId, allRefs, allElements, setAllElements, setGridMoving, setElementUpdated) {
    const difY = gridMoving.y2 - gridMoving.y1
    const difX = gridMoving.x2 - gridMoving.x1
    let gridBoundingBox = gridMoving.gridBoundingBox
    let top = difY + gridBoundingBox.top
    let bottom = difY + gridBoundingBox.bottom
    let left = difX + gridBoundingBox.left
    let right = difX + gridBoundingBox.right
    const newStyle = calculateMovement(gridMoving, top, right, bottom, left, parentId, allRefs, allElements, setAllElements)
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))

        return
    }
    if (gridMoving.moved === true) {
        setAllElements((currentState) =>
        produce(currentState, (draft) => {
            if (draft[gridMoving.id]) {
                draft[gridMoving.id].style = newStyle
            }
        })
        )
        setElementUpdated(gridMoving.id)
        setGridMoving({ moving: false })
        return
    }

    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            if (draft[gridMoving.id]) {
                draft[gridMoving.id].style = newStyle
            }
        })
    )
}
