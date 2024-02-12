export default function startResizingElement(event, elementId, parentId, elementInfo, allRefs, type, position, setGridMoving) {
    const elementBoundingBox = allRefs[parentId].getBoundingClientRect()
    let pos = {
        x2: 0,
        y2: 0,
        y1: 0,
        x1: 0,
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
    if (position == 5) {
        pos.x1 = elementBoundingBox.left
        pos.y1 = elementBoundingBox.bottom
        pos.x2 = elementBoundingBox.right
    }
    if (position == 6) {
        pos.y1 = elementBoundingBox.top
        pos.y2 = elementBoundingBox.bottom
        pos.x1 = elementBoundingBox.left
    }
    if (position == 7) {
        pos.x1 = elementBoundingBox.left
        pos.y1 = elementBoundingBox.top
        pos.x2 = elementBoundingBox.right
    }
    if (position == 8) {
        pos.y1 = elementBoundingBox.top
        pos.y2 = elementBoundingBox.bottom
        pos.x1 = elementBoundingBox.right
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
