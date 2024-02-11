// eslint-disable-next-line no-unused-vars
import React from "react"
import calculatePositionInGrid from "./calculatePositionInGrid"
import getBoundingBox from "./getBoundingBox"
import Grid from "../Grid"
import handleGridoutOfBounds from "./handleGridoutOfBounds"

export default function calculateMovement(
    gridMoving,
    top,
    right,
    bottom,
    left,
    width,
    height,
    parentRef,
    gridSizeX,
    gridSizeY,
    parentProps,
    setParentElements,
    setGrandParentElements
) {
    let parentBoundingBox = getBoundingBox(parentRef)
    
    let gridCords = calculatePositionInGrid({ x1: left, y1: top, x2: right, y2: bottom }, parentBoundingBox, gridSizeX, gridSizeY)
    console.log("paskuitinis", { x1: left, y1: top, x2: right, y2: bottom })
    console.log("gridCords", gridCords)
    const desiredSizeX = Math.floor((width / parentBoundingBox.width) * gridSizeX) + 1
    const desiredSizeY = Math.floor((height / parentBoundingBox.height) * gridSizeY) + 1
    if (gridCords.y1 < 0) {
        if (top - parentBoundingBox.top < -30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, width, height, parentProps, setParentElements, setGrandParentElements)
            if (updated) return false
            gridCords.y1 = 0
        } else {
            gridCords.y1 = 0
        }
    }
    if (gridSizeY - gridCords.y2 <0) {
        console.log("bottom - parentBoundingBox.bottom > 30", top + height - parentBoundingBox.bottom)
        if (top + height - parentBoundingBox.bottom > 30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, width, height, parentProps, setParentElements, setGrandParentElements)
            if (updated) return false
            gridCords.y2 = gridSizeY
            gridCords.y1 = gridCords.y2 - desiredSizeY
        } else {
            return false
        }
    }
    if (gridCords.x1 < 0) {
        if (left - parentBoundingBox.left < -30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, width, height, parentProps, setParentElements, setGrandParentElements)
            if (updated) return false
            gridCords.x1 = gridSizeX
        } else {
            return false
        }
    }
    if (gridSizeX - gridCords.x2 < 0) {
        if (left + width - parentBoundingBox.right > 30) {
            let updated = handleGridoutOfBounds(gridMoving, top, right, bottom, left, width, height, parentProps, setParentElements, setGrandParentElements)
            if (updated) return false
            gridCords.x2 = gridSizeX
            gridCords.x1 = gridCords.x2 - desiredSizeX
        } else {
            return false
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
