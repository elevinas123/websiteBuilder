import { AllElements, SetAllElements } from "../Types"
import { GridMoving, SetGridMoving } from "../atoms"
import UndoTree from "../UndoTree"
import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"

export default function handleMarginResize(
    gridMoving: GridMoving,
    allElements: AllElements,
    gridPixelSize: number,
    HistoryClass: UndoTree<AllElements>,
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements
) {
    const elementInfo = allElements[gridMoving.id].info
    // Access the current border widths
    let marginTop = elementInfo.margin.top
    let marginRight = elementInfo.margin.right
    let marginBottom = elementInfo.margin.bottom
    let marginLeft = elementInfo.margin.left
    let marginTopAdded = 0
    let marginLeftAdded = 0
    let marginRightAdded = 0
    let marginBottomAdded = 0
    let deltaX = (gridMoving.x2 - gridMoving.x1) / gridPixelSize
    let deltaY = (gridMoving.y2 - gridMoving.y1) / gridPixelSize

    if (gridMoving.type === "margin-top") {
        marginTopAdded += deltaY
    } else if (gridMoving.type === "margin-right") {
        marginRightAdded -= deltaX
    } else if (gridMoving.type === "margin-bottom") {
        marginBottomAdded -= deltaY
    } else if (gridMoving.type === "margin-left") {
        marginLeftAdded += deltaX
    }
    const parentId = allElements[gridMoving.id].parent
    if (!parentId) throw new Error("parent id must be a string")
    const lastElement = allElements[allElements[parentId].children[allElements[parentId].children.length - 1]]
    console.log("lastElement", lastElement)
    if (
        marginLeftAdded >= 0 &&
        marginRightAdded >= 0 &&
        allElements[parentId].info.contentWidth <
            lastElement.info.left +
                lastElement.info.itemWidth +
                lastElement.info.margin.left +
                lastElement.info.margin.right +
                marginLeftAdded +
                marginRightAdded
    ) {
        marginLeftAdded = 0
        marginRightAdded = 0
    }
    if (
        marginTopAdded >= 0 &&
        marginBottomAdded >= 0 &&
        allElements[parentId].info.contentHeight <
            lastElement.info.top + lastElement.info.itemHeight + lastElement.info.margin.top + lastElement.info.margin.bottom + marginTopAdded + marginBottom
    ) {
        marginTopAdded = 0
        marginBottomAdded = 0
    }
    // Ensure border widths do not go negative
    marginTop += marginTopAdded
    marginLeft += marginLeftAdded
    marginRight += marginRightAdded
    marginBottom += marginBottomAdded
    marginTop = Math.max(marginTop, 0)
    marginRight = Math.max(marginRight, 0)
    marginBottom = Math.max(marginBottom, 0)
    marginLeft = Math.max(marginLeft, 0)
    const parentJustify = allElements[parentId].info.justifyDirection
    const idsToUpdate = allElements[parentId].children.slice(allElements[parentId].children.indexOf(gridMoving.id))

    // Update the element with the new border widths
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            // Loop over each ID in idsToUpdate to update all relevant elements
            idsToUpdate.forEach((id) => {
                const element = draft[id]
                if (!element) return
                if (id === gridMoving.id) {
                    // Check if the element exists
                    const newStyle = calculateNewStyle(
                        marginLeft + element.info.left,
                        marginTop + element.info.top,
                        element.info.itemWidth,
                        element.info.itemHeight,
                        gridPixelSize,
                        element.info.backgroundColor
                    )
                    // Update the element's info and style properties
                    element.info = {
                        ...element.info,
                        margin: {
                            ...element.info.margin,
                            top: marginTop,
                            left: marginLeft,
                            bottom: marginBottom,
                            right: marginRight,
                        },
                    }
                    element.style = {
                        ...element.style,
                        ...newStyle,
                    }
                } else {
                    // For other elements, check parentJustify to decide on updating left or top
                    if (parentJustify === "row") {
                        // Only update left for 'row'
                        element.info.left += marginLeftAdded + marginRightAdded
                    } else {
                        // Otherwise, only update top
                        element.info.top += marginTopAdded + marginBottomAdded
                    }

                    // Recalculate the new style based on potentially updated left or top values
                    const newStyle = calculateNewStyle(
                        element.info.left + element.info.margin.left,
                        element.info.top + element.info.margin.top,
                        element.info.itemWidth,
                        element.info.itemHeight,
                        gridPixelSize,
                        element.info.backgroundColor
                    )

                    element.style = {
                        ...element.style,
                        ...newStyle,
                    }
                }
            })
        })
    )

    if (gridMoving.moved) {
        setGridMoving((i) => ({ ...i, moving: false }))
        HistoryClass.performAction(allElements)
        console.log(HistoryClass.currentNode)
        return
    }

    setGridMoving((i) => ({ ...i, setBox: true }))
    return
}
