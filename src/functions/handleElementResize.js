import { produce } from "immer"
import calculateMovement from "./calculateMovement"
import calculateChildrenMovement from "./calculateChildrenMovement"

export default function handleElementResize(gridMoving, parentId, allRefs, allElements, setAllElements, setGridMoving, setElementUpdated, elementsPosition) {
    let top = gridMoving.y1
    let bottom = gridMoving.y2
    let left = gridMoving.x1
    let right = gridMoving.x2
    const gridSize = allElements[gridMoving.id].gridSize
    const newStyle = calculateMovement(gridMoving, top, right, bottom, left, parentId, allRefs, allElements, setAllElements)
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        return
    }
    const width = Math.max(left, right) - Math.min(left, right)
    const height = Math.max(bottom, top) - Math.min(bottom, top)
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            // Update the parent element
            const parentElement = draft[gridMoving.id]
            if (parentElement) {
                parentElement.height = height
                parentElement.width = width
                parentElement.style = {
                    ...parentElement.style,
                    ...newStyle,
                    gridTemplateColumns: `repeat(${Math.floor(width / 2)}, 2px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${Math.floor(height / 2)}, 2px)`,
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
