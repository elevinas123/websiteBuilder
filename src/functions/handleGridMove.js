import calculateMovement from "./calculateMovement"

export default function handleGridMove(gridMoving, elementWidth, elementHeight, parentRef, elementSizeX, elementSizeY, setStyle, setElements, setGridMoving) {
    let gridBoundingBox = gridMoving.gridBoundingBox
    console.log(gridBoundingBox)
    let top = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.top
    let bottom = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.bottom
    let left = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.left
    let right = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.right
    calculateMovement(
        gridMoving,
        setGridMoving,
        top,
        right,
        bottom,
        left,
        elementWidth,
        elementHeight,
        parentRef,
        elementSizeX,
        elementSizeY,
        setStyle,
        setElements
    )
}
