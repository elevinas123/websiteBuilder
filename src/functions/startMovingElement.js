export default function startMovingElement(event, elementId, parentId, elementInfo, allRefs, type, allElements, setGridMoving) {
    const elementBoundingBox = allRefs[parentId].getBoundingClientRect()
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
            top: elementBoundingBox.top,
            bottom: elementBoundingBox.top + elementInfo.height,
            left: elementBoundingBox.left,
            right: elementBoundingBox.left + elementInfo.width,
        },
    })
    return
}
