export default function calculatePositionInGrid(itemCords, gridInfo) {
    let x1 = Math.floor(((itemCords.x1 - gridInfo.left) / gridInfo.width) * gridInfo.gridSize.x)
    let x2 = Math.floor(((itemCords.x2 - gridInfo.left) / gridInfo.width) * gridInfo.gridSize.x)
    let y1 = Math.floor(((itemCords.y1 - gridInfo.top) / gridInfo.height) * gridInfo.gridSize.y)
    let y2 = Math.floor(((itemCords.y2 - gridInfo.top) / gridInfo.height) * gridInfo.gridSize.y)
    return { x1, x2, y1, y2 }
}
