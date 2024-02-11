import calculatePositionInGrid from "./calculatePositionInGrid"
import handleGridoutOfBounds from "./handleGridoutOfBounds"

export default function calculateMovement(gridMoving, top, right, bottom, left, parentId, allElements, setAllElements) {
    const parentElement = allElements[parentId]
    let parentInfo = {
        top: parentElement.top,
        bottom: parentElement.bottom,
        right: parentElement.right,
        left: parentElement.left,
        width: parentElement.width,
        height: parentElement.height,
        gridSize: parentElement.gridSize,
    }
    let elementMoved = allElements[gridMoving.id]
    console.log("element", allElements[gridMoving.id], gridMoving.id)
    let gridCords = calculatePositionInGrid({ x1: left, y1: top, x2: right, y2: bottom }, parentInfo)
    console.log("paskuitinis", { x1: left, y1: top, x2: right, y2: bottom })
    console.log("parentInfo", parentInfo)
    console.log("gridCords", gridCords)
    const desiredSizeX = Math.floor((elementMoved.width / parentInfo.width) * parentInfo.gridSize.x)
    const desiredSizeY = Math.floor((elementMoved.height / parentInfo.height) * parentInfo.gridSize.y)
    if (gridCords.y1 < 0) {
        if (top - parentInfo.top < -30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, setAllElements)
            if (updated) return false
            gridCords.y1 = 0
        } else {
            gridCords.y1 = 0
        }
    }
    if (parentInfo.gridSize.y - gridCords.y2 < 0) {
        console.log("bottom - parentBoundingBox.bottom > 30", top + elementMoved.height - parentInfo.bottom)
        if (top + elementMoved.height - parentInfo.bottom > 30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, setAllElements)
            if (updated) return false
            gridCords.y2 = parentInfo.gridSize.y
            gridCords.y1 = gridCords.y2 - desiredSizeY
        } else {
            gridCords.y2 = parentInfo.gridSize.y
            gridCords.y1 = gridCords.y2 - desiredSizeY
        }
    }
    if (gridCords.x1 < 0) {
        if (left - parentInfo.left < -30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, setAllElements)
            if (updated) return false
            gridCords.x1 = 0
        } else {
            gridCords.x1 = 0
        }
    }
    if (parentInfo.gridSize.x - gridCords.x2 < 0) {
        if (left + elementMoved.width - parentInfo.right > 30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, setAllElements)
            if (updated) return false
            gridCords.x2 = parentInfo.gridSize.x
            gridCords.x1 = gridCords.x2 - desiredSizeX
        } else {
            gridCords.x2 = parentInfo.gridSize.x
            gridCords.x1 = gridCords.x2 - desiredSizeX
        }
    }

    if (gridMoving.type === "moving") {
        gridCords.x2 = gridCords.x1 + desiredSizeX
        gridCords.y2 = gridCords.y1 + desiredSizeY
    }

    const newStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
        overflow: "hidden", // Prevents content from overflowing
    }
    return newStyle
}
