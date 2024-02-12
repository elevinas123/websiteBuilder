export default function startResizingElement(event, elementId, parentId, elementInfo, allRefs, type, position, setGridMoving) {
    const elementBoundingBox = allRefs[parentId].getBoundingClientRect()
    let pos = {
        x2: event.clientX,
        y2: event.clientX,
    }
    if (position == 1) {
        pos.x1 = elementBoundingBox.right
        pos.y1 = elementBoundingBox.bottom
    }
    if (position == 2) {
        pos.x1 = elementBoundingBox.left
        pos.y1 = elementBoundingBox.bottom
    }
    if (position == 3) {
        pos.x1 = elementBoundingBox.left
        pos.y1 = elementBoundingBox.top
    }
    if (position == 4) {
        pos.x1 = elementBoundingBox.right
        pos.y1 = elementBoundingBox.top
    }
    setGridMoving({
        ...pos,
        type: type,
        id: elementId,
        moving: true,
        setBox: true,
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
