import calculateMovement from "./calculateMovement"

export default function handleGridCreation(gridMoving, parentId, allElements, setAllElements, setGridMoving) {
    let top = gridMoving.y1
    let bottom = gridMoving.y2
    let left = gridMoving.x1
    let right = gridMoving.x2
    const newStyle = calculateMovement(gridMoving, top, right, bottom, left, parentId, allElements, setAllElements)
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        return
    }
    const elementId = gridMoving.id
    setAllElements((i) => ({
        ...i,
        [elementId]: {
            ...i[elementId],
            top,
            right,
            bottom,
            left,
            height: bottom-top,
            width: right-left,
            style: newStyle,
        },
    }))

    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
}
