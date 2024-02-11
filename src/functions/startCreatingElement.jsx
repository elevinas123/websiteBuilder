import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import getBoundingBox from "./getBoundingBox"
import calculatePositionInGrid from "./calculatePositionInGrid"
import startMovingElement from "./startMovingElement"

export default function startCreatingElement(
    event,
    elementRef,
    elementSizeX,
    elementSizeY,
    elementLevel,
    elementId,
    parentProps,
    setGridMoving,
    setElements,
    setParentElements
) {
    const uuid = uuidv4()
    let boundingBox = getBoundingBox(elementRef)
    let gridCords = calculatePositionInGrid(
        { x1: event.clientX, y1: event.clientY, x2: event.clientX, y2: event.clientY },
        boundingBox,
        elementSizeX,
        elementSizeY
    )
    const newStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
        overflow: "hidden", // Prevents content from overflowing
    }
    setElements((i) => [
        ...i,
        <Grid
            parentProps={parentProps}
            setParentElements={setElements}
            setGrandParentElements={setParentElements}
            key={uuid}
            className="bg-red-500"
            parentRef={elementRef}
            id={uuid}
            childStyle={newStyle}
            parentSizeX={elementSizeX}
            parentSizeY={elementSizeY}
            level={elementLevel + 1}
        ></Grid>,
    ])
    console.log("gridCords", gridCords)
    startMovingElement(event, elementRef, { height: 0, width: 0 }, elementId, "creating", setGridMoving)
}
