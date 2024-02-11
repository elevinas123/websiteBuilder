import calculateMovement from "./calculateMovement"
import { produce } from "immer"
export default function handleGridCreation(gridMoving, parentId, allRefs, allElements, setAllElements, setGridMoving) {
    let top = gridMoving.y1
    let bottom = gridMoving.y2
    let left = gridMoving.x1
    let right = gridMoving.x2
    const newStyle = calculateMovement(gridMoving, top, right, bottom, left, parentId, allRefs, allElements, setAllElements)
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        return
    }
    const elementId = gridMoving.id
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[elementId]
            if (element) {
                element.height = bottom - top
                element.width = right - left
                element.style = newStyle // Assuming newStyle is defined and contains the style updates
            }
        })
    )

    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
}
