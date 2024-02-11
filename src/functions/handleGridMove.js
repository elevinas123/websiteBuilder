import calculateMovement from "./calculateMovement"

export default function handleGridMove(gridMoving, parentId, allElements, setAllElements, setGridMoving) {
    let gridBoundingBox = gridMoving.gridBoundingBox
    console.log(gridBoundingBox)
    let top = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.top
    let bottom = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.bottom
    let left = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.left
    let right = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.right
    const newStyle = calculateMovement(gridMoving, top, right, bottom, left, parentId, allElements, setAllElements)
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        return
    }
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        return
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
    setAllElements((i) => ({
        ...i,
        [gridMoving.id]: {
            ...i[gridMoving.id],
            top,
            right,
            bottom,
            left,
            height: gridMoving.height,
            style: newStyle,
        },
    }))
}
