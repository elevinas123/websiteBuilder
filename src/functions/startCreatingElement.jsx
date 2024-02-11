import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import calculatePositionInGrid from "./calculatePositionInGrid"
import startMovingElement from "./startMovingElement"

export default function startCreatingElement(event, parentId, allElements, setGridMoving, setAllElements) {
    const uuid = uuidv4()
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
    let gridCords = calculatePositionInGrid({ x1: event.clientX, y1: event.clientY, x2: event.clientX, y2: event.clientY }, parentInfo)
    const newStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
        overflow: "hidden", // Prevents content from overflowing
    }

    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: {
            item: <Grid key={uuid} className="bg-red-500" id={uuid} childStyle={newStyle}></Grid>,
            id: uuid,
            gridSize: {
                x: 300,
                y: 300,
            },
            width: 1,
            height: 1,
            top: event.clientY,
            right: event.clientX,
            bottom: event.clientY,
            left: event.clientX,
            style: newStyle,
            parent: parentId,
            children: [],
        },
    }))
    console.log("gridCords", gridCords)
    startMovingElement(event, parentId, uuid, 0, 0, "creating", allElements, setGridMoving)
}
