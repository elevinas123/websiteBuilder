import getBoundingBox from "./getBoundingBox"

export default function startMovingElement(event, elementRef, size, id, type, setGridMoving) {
    let gridBoundingBox = getBoundingBox(elementRef)
    setGridMoving({
        type: type,
        id: id,
        moving: true,
        setBox: true,
        x1: event.clientX,
        y1: event.clientY,
        x2: event.clientX,
        y2: event.clientY,
        moved: false,
        gridBoundingBox: {
            top: gridBoundingBox.top,
            bottom: gridBoundingBox.top + size.height,
            left: gridBoundingBox.left,
            right: gridBoundingBox.left + size.width,
        },
    })
    return
}
