import Grid from "../Grid"
import calculateMovement from "./calculateMovement"

export default function handleGridCreation(
    gridMoving,
    elementWidth,
    elementHeight,
    elementRef,
    elementSizeX,
    elementSizeY,
    parentProps,
    childElements,
    setStyle,
    setElements,
    setGridMoving,
    setParentElements,
    setGrandParentElements
) {
    let top = gridMoving.y1
    let bottom = gridMoving.y2
    let left = gridMoving.x1
    let right = gridMoving.x2
    const newStyle = calculateMovement(
        gridMoving,
        top,
        right,
        bottom,
        left,
        elementWidth,
        elementHeight,
        elementRef,
        elementSizeX,
        elementSizeY,
        parentProps,
        childElements,
        setParentElements,
        setGrandParentElements
    )
    if (!newStyle) {
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        return
    }
    setElements((prevElements) => {
        const newElements = prevElements.slice(0, -1)
        const lastElement = prevElements[prevElements.length - 1]

        newElements.push(
            <Grid
                {...lastElement.props}
                childStyle={newStyle}
                size={{ width: right - left, height: bottom - top }}
                key={lastElement.key || "some-unique-key"} // Adjust key as necessary
            />
        )
        return newElements
    })
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
    }
    setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
}
