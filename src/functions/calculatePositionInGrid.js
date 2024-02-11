export default function calculatePositionInGrid(itemCords, gridBoundingBox, gridSizeX, gridSizeY) {
    let x1 = Math.floor(((itemCords.x1 - gridBoundingBox.left) / gridBoundingBox.width) * gridSizeX)
    let x2 = Math.floor(((itemCords.x2 - gridBoundingBox.left) / gridBoundingBox.width) * gridSizeX)
    let y1 = Math.floor(((itemCords.y1 - gridBoundingBox.top) / gridBoundingBox.height) * gridSizeY)
    let y2 = Math.floor(((itemCords.y2 - gridBoundingBox.top) / gridBoundingBox.height) * gridSizeY)
    return { x1, x2, y1, y2 }
}
