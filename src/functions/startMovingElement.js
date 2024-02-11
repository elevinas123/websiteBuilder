export default function startMovingElement(event, parentId, elementId, elementHeight, elementWidth, type, allElements, setGridMoving) {
    const parentElement = allElements[parentId]
    const parentInfo = {
        top: parentElement.top,
        left: parentElement.left,
        width: parentElement.width,
        height: parentElement.height,
        gridSize: parentElement.gridSize,
    }
    console.log("labas", allElements[elementId],elementId)
    setGridMoving({
        type: type,
        id: elementId,
        moving: true,
        setBox: true,
        x1: event.clientX,
        y1: event.clientY,
        x2: event.clientX,
        y2: event.clientY,
        moved: false,
        gridBoundingBox: {
            top: parentInfo.top,
            bottom: parentInfo.top + elementHeight,
            left: parentInfo.left,
            right: parentInfo.left + elementWidth,
        },
    })
    return
}
