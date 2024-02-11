import calculateMovement from "./calculateMovement"
import { produce } from "immer"
export default function handleGridMove(gridMoving, parentId, allRefs, allElements, setAllElements, setGridMoving) {
    let gridBoundingBox = gridMoving.gridBoundingBox
    let top = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.top
    let bottom = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.bottom
    let left = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.left
    let right = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.right
    const newStyle = calculateMovement(gridMoving, top, right, bottom, left, parentId, allRefs, allElements, setAllElements)
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        setAllElements((currentState) =>
            produce(currentState, (draft) => {
                if (draft[gridMoving.id]) {
                    draft[gridMoving.id].style = newStyle
                }
            })
        )
        return
    }
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        setAllElements((currentState) =>
            produce(currentState, (draft) => {
                if (draft[gridMoving.id]) {
                    draft[gridMoving.id].style = newStyle
                }
            })
        )
        
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
