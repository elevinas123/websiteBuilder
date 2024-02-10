// eslint-disable-next-line no-unused-vars
import React from "react"
import calculatePositionInGrid from "./calculatePositionInGrid"
import getBoundingBox from "./getBoundingBox"
import Grid from "../Grid"

export default function calculateMovement(
    gridMoving,
    setGridMoving,
    top,
    right,
    bottom,
    left,
    width,
    height,
    parentRef,
    gridSizeX,
    gridSizeY,
    setStyle,
    setElements
) {
    //console.log("level", props.level)
    let parentBoundingBox = getBoundingBox(parentRef)
    console.log("right", right)
    console.log("parentBoundingBox", parentBoundingBox)
    console.log("paskuitinis", { x1: left, y1: top, x2: right, y2: bottom })
    console.log("gridMoving", gridMoving)
    let gridCords = calculatePositionInGrid({ x1: left, y1: top, x2: right, y2: bottom }, parentBoundingBox, gridSizeX, gridSizeY)
    console.log("gridCords", gridCords)
    if (gridMoving.type === "moving") {
        const desiredSizeX = Math.floor((width / parentBoundingBox.width) * gridSizeX) + 1
        const desiredSizeY = Math.floor((height / parentBoundingBox.height) * gridSizeY) + 1
        gridCords.x2 = gridCords.x1 + desiredSizeX
        gridCords.y2 = gridCords.y1 + desiredSizeY
    }
    //console.log("gridCords", desiredSizeX)
    //console.log("gridCords", desiredSizeY)

    const newStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
        overflow: "hidden", // Prevents content from overflowing
    }
    //console.log("style", newStyle)
    if (gridMoving.type === "moving") {
        setStyle(newStyle)
    }
    if (gridMoving.type === "creating") {
        setElements((prevElements) => {
            const newElements = prevElements.slice(0, -1)
            const lastElement = prevElements[prevElements.length - 1]

            newElements.push(
                <Grid
                    {...lastElement.props}
                    childStyle={newStyle}
                    key={lastElement.key || "some-unique-key"} // Adjust key as necessary
                />
            )
            return newElements
        })
    }
    console.log("style", newStyle)
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
    //console.log(gridCords)
    //console.log(gridMoving)
    //console.log(props.id)
    return
}
