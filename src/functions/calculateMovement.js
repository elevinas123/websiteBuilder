import calculatePositionInGrid from "./calculatePositionInGrid"
import handleGridoutOfBounds from "./handleGridoutOfBounds"

export default function calculateMovement(gridMoving, top, right, bottom, left, parentId, allRefs, allElements, setAllElements) {
    const parentElement = allElements[parentId]
    const parentBoundingBox = allRefs[parentId].getBoundingClientRect()
    let parentInfo = {
        top: parentBoundingBox.top,
        bottom: parentBoundingBox.bottom,
        right: parentBoundingBox.right,
        left: parentBoundingBox.left,
        width: parentElement.width,
        height: parentElement.height,
        gridSize: parentElement.gridSize,
    }
    let elementMoved = allElements[gridMoving.id]
    let gridCords = calculatePositionInGrid({ x1: left, y1: top, x2: right, y2: bottom }, parentInfo)
    const desiredSizeX = Math.floor((elementMoved.width / parentInfo.width) * parentInfo.gridSize.x)
    const desiredSizeY = Math.floor((elementMoved.height / parentInfo.height) * parentInfo.gridSize.y)
    if (gridCords.y1 < 0) {
        if (top - parentInfo.top < -30) {
            let updated = handleGridoutOfBounds(gridMoving, parentId, allRefs, allElements, setAllElements)
            if (updated) return false
            gridCords.y1 = 0
        } else {
            gridCords.y1 = 0
        }
    }
    if (parentInfo.gridSize.y - gridCords.y2 < 0) {
        if (top + elementMoved.height - parentInfo.bottom > 30) {
            let updated = handleGridoutOfBounds(gridMoving, parentId, allRefs, allElements, setAllElements)
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
            let updated = handleGridoutOfBounds(gridMoving, parentId, allRefs, allElements, setAllElements)
            if (updated) return false
            gridCords.x1 = 0
        } else {
            gridCords.x1 = 0
        }
    }
    if (parentInfo.gridSize.x - gridCords.x2 < 0) {
        if (left + elementMoved.width - parentInfo.right > 30) {
            let updated = handleGridoutOfBounds(gridMoving, parentId, allRefs, allElements, setAllElements)

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
    }
    return newStyle
}
