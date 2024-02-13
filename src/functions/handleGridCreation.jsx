import calculateMovement from "./calculateMovement"
import { produce } from "immer"
export default function handleGridCreation(gridMoving, parentId, allRefs, allElements, setAllElements, setGridMoving, setElementUpdated) {
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
    const width = Math.max(left, right) - Math.min(left, right)
    const height = Math.max(bottom, top) - Math.min(bottom, top)
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[elementId]
            if (element) {
                element.height = height
                element.width = width
                element.style = {
                    ...element.style,
                    ...newStyle,
                    gridTemplateColumns: `repeat(${Math.floor(width / 2)}, 2px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${Math.floor(height / 2)}, 2px)`,
                }
                element.gridSize = {
                    x: Math.floor(width / 2),
                    y: Math.floor(height / 2),
                }
            }
        })
    )

    if (gridMoving.moved === true) {
        setElementUpdated(gridMoving.id)
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
}
