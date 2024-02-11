import calculateMovement from "./calculateMovement"

export default function handleGridMove(
    gridMoving,
    elementWidth,
    elementHeight,
    parentRef,
    elementSizeX,
    elementSizeY,
    parentProps,
    childElements,
    setStyle,
    setElements,
    setGridMoving,
    setParentElements,
    setGrandParentElements
) {
    let gridBoundingBox = gridMoving.gridBoundingBox
    console.log(gridBoundingBox)
    let top = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.top
    let bottom = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.bottom
    let left = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.left
    let right = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.right
    const newStyle = calculateMovement(
        gridMoving,
        top,
        right,
        bottom,
        left,
        elementWidth,
        elementHeight,
        parentRef,
        elementSizeX,
        elementSizeY,
        parentProps,
        childElements,
        setParentElements,
        setGrandParentElements
    )
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        return
    }
    setStyle(newStyle)
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
}
