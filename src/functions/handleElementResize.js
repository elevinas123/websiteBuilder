import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import calculatePositionInGrid from "./calculatePositionInGrid"
import startMovingElement from "./startMovingElement"
import getBoundingBox from "./getBoundingBox"
import { produce } from "immer"
import calculateMovement from "./calculateMovement"

export default function handleElementResize(gridMoving, parentId, allRefs, allElements, setAllElements, setGridMoving) {
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
                element.height = Math.max(bottom, top) - Math.min(bottom, top)
                element.width = Math.max(left, right) - Math.min(left, right)
                element.style = newStyle // Assuming newStyle is defined and contains the style updates
            }
        })
    )

    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
}