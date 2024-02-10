import calculateMovement from "./calculateMovement"

export default function handleGridCreation(
    gridMoving,
    elementWidth,
    elementHeight,
    elementRef,
    elementSizeX,
    elementSizeY,
    setStyle,
    setElements,
    setGridMoving
) {
    let top = gridMoving.y1
    let bottom = gridMoving.y2
    let left = gridMoving.x1
    let right = gridMoving.x2
    calculateMovement(
        gridMoving,
        setGridMoving,
        top,
        right,
        bottom,
        left,
        elementWidth,
        elementHeight,
        elementRef,
        elementSizeX,
        elementSizeY,
        setStyle,
        setElements
    )
}
