import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import calculatePositionInGrid from "./calculatePositionInGrid"
import startMovingElement from "./startMovingElement"
import getBoundingBox from "./getBoundingBox"

export default function startCreatingElement(event, parentId, allRefs, allElements, setGridMoving, setAllElements) {
    const uuid = uuidv4()
    const parentBoundingBox = allRefs[parentId].getBoundingClientRect()
    const parentElement = allElements[parentId]
    let parentInfo = {
        top: parentBoundingBox.top,
        bottom: parentBoundingBox.bottom,
        right: parentBoundingBox.right,
        left: parentBoundingBox.left,
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
    const elementInfo = {
        top: event.clientY,
        left: event.clientX,
        width: event.clientX,
        bottom: event.clientY,
        height: 0,
        gridSize: 0,
    }
    startMovingElement(event, uuid, parentId, elementInfo, allRefs, "creating", allElements, setGridMoving)
}
