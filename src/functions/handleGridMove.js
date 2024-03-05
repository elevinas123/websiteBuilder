import { produce } from "immer"
import calculateMovement from "./calculateMovement"
import calculateNewStyle from "./calculateNewStyle"
import { calculateIntersectLines } from "./calculateIntersectLines"

export default function handleGridMove(
    gridMoving,
    allElements,
    gridPixelSize,
    HistoryClass,
    allPositions,
    setGridMoving,
    setAllElements,
    setAllPositions,
    setIntersectionLines
) {
    let top = allElements[gridMoving.id].top
    let left = allElements[gridMoving.id].left
    const width = allElements[gridMoving.id].width
    const height = allElements[gridMoving.id].height
    const backgroundColor = allElements[gridMoving.id].style.backgroundColor

    // Calculate new positions and round them to the nearest whole number
    let newLeft = Math.round((left + (gridMoving.x2 - gridMoving.x1) / gridPixelSize) * 100) / 100
    let newTop = Math.round((top + (gridMoving.y2 - gridMoving.y1) / gridPixelSize) * 100) / 100

    const parentId = allElements[gridMoving.id].parent
    const parentInfo = {
        top: allElements[parentId].top,
        left: allElements[parentId].left,
        width: allElements[parentId].width,
        height: allElements[parentId].height,
    }

    // Adjust positions to ensure the moved element remains within its parent's bounds
    if (newTop + height > parentInfo.height) {
        newTop = parentInfo.height - height
    }
    if (newTop < 0) {
        newTop = 0
    }
    if (newLeft + width > parentInfo.width) {
        newLeft = parentInfo.width - width
    }
    if (newLeft < 0) {
        newLeft = 0
    }
    const intersections = calculateIntersectLines(gridMoving.id, newLeft, newTop, width, height, allElements, allPositions, setAllPositions)
    let offsetConfig = {
        offset: gridMoving.offset,
        offsetLeft: gridMoving.offsetLeft,
        offsetTop: gridMoving.offsetTop,
    }
    let newStyle = calculateNewStyle(newLeft, newTop, width, height, gridPixelSize, backgroundColor)
    console.log("gridMoving", gridMoving)

    let applyLeftAdjustment = false
    let applyTopAdjustment = false

    // Determine if horizontal or vertical adjustments should be applied
    if (gridMoving.offset) {
        if (Math.abs(gridMoving.offsetLeft) <= 2) {
            applyLeftAdjustment = true
        }
        if (Math.abs(gridMoving.offsetTop) <= 2) {
            applyTopAdjustment = true
        }
    }

    if (intersections.length > 0 || applyLeftAdjustment || applyTopAdjustment) {
        console.log("Applying minor adjustment due to gridMoving offset:", gridMoving)

        // Calculate new left and top positions based on whether adjustments are applied
        const adjustedLeft = applyLeftAdjustment ? newLeft - gridMoving.offsetLeft : newLeft
        const adjustedTop = applyTopAdjustment ? newTop - gridMoving.offsetTop : newTop

        // Apply adjustments to calculate new style
        newStyle = calculateNewStyle(adjustedLeft, adjustedTop, width, height, gridPixelSize, backgroundColor)

        // Update the offset configuration for minor adjustments
        if (applyLeftAdjustment) {
            offsetConfig.offsetLeft += (gridMoving.x2 - gridMoving.x1) / gridPixelSize
        }
        if (applyTopAdjustment) {
            offsetConfig.offsetTop += (gridMoving.y2 - gridMoving.y1) / gridPixelSize
        }
        offsetConfig.offset = applyLeftAdjustment || applyTopAdjustment || intersections.length > 0
    } else {
        // Reset offsetConfig if no adjustments are to be made
        console.log("Resetting offsetConfig due to significant movement or lack of offset")
        offsetConfig.offset = false
        offsetConfig.offsetLeft = 0
        offsetConfig.offsetTop = 0
    }

    // Update elements' positions and styles
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[gridMoving.id]
            if (element) {
                element.top = newTop
                element.left = newLeft
                element.style = {
                    ...element.style,
                    ...newStyle,
                }
            }
        })
    )

    // Reset moving state if the move is completed
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        HistoryClass.performAction(allElements)
        setIntersectionLines([])

        return
    }
    // Continue moving
    setIntersectionLines(intersections)
    setGridMoving((i) => ({ ...i, setBox: true, ...offsetConfig }))
}
