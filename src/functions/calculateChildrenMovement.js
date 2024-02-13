

import calculatePositionInGrid from "./calculatePositionInGrid"

export default function calculateChildrenMovement(childId, parentTop, parentRight, parentBot, parentLeft, parentWidth, parentheight, parentGridSize, allRefs, allElements) {
    console.log(childId, parentTop, parentRight, parentBot, parentLeft, parentGridSize, allRefs, allElements)
    let parentInfo = {
        top: parentTop,
        right: parentRight,
        bottom: parentBot,
        left: parentLeft,
        width: parentWidth,
        height: parentheight,
        gridSize: parentGridSize,
    }
    console.log(parentInfo)
    const childPositions = allRefs[childId]
    let childElementMoved = allElements[childId]
    console.log(childPositions)
    let gridCords = calculatePositionInGrid(
        {
            x1: childPositions.left,
            y1: childPositions.top,
            x2: childPositions.left + childElementMoved.width,
            y2: childPositions.top + childElementMoved.height,
        },
        parentInfo
    )
    console.log(gridCords)
    const desiredSizeX = Math.floor((childElementMoved.width / parentInfo.width) * parentInfo.gridSize.x)
    const desiredSizeY = Math.floor((childElementMoved.height / parentInfo.height) * parentInfo.gridSize.y)
    gridCords.x2 = gridCords.x1 + desiredSizeX
    gridCords.y2 = gridCords.y1 + desiredSizeY
    const newStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
    }
    return newStyle
}
