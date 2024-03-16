import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"
import { createNewGrid } from "./gridCRUD"
import { AllElements, GridElement, SetAllElements } from "../Types"
import { SetGridChecked, SetGridMoving } from "../atoms"

interface MainGridOffset {
    left: number
    top: number
}

export default function startCreatingElement(
    x: number,
    y: number,
    parentId: string,
    allElements: AllElements,
    mainGridOffset: MainGridOffset,
    gridPixelSize: number,
    setGridMoving: SetGridMoving,
    setAllElements: SetAllElements,
    setGridChecked: SetGridChecked
) {
    const uuid = uuidv4()
    let offSetLeft = mainGridOffset.left
    let offSetTop = mainGridOffset.top
    let pId: string | null = parentId
    while (pId !== null) {
        const ell: GridElement = allElements[pId]
        offSetLeft -= ell.info.left + ell.info.padding.left + ell.info.border.borderLeft.borderWidth - 1 + ell.info.margin.left + ell.info.margin.right
        offSetTop -= ell.info.top + ell.info.padding.top + ell.info.border.borderTop.borderWidth - 1 + ell.info.margin.top + ell.info.margin.bottom
        pId = ell.parent
    }
    const elementBefore = allElements[allElements[parentId].children[allElements[parentId].children.length - 1]]
    let left: number, top: number, marginTop: number, marginLeft: number
    if (elementBefore) {
        left = elementBefore.info.left + elementBefore.info.margin.left + elementBefore.info.itemWidth + elementBefore.info.margin.right + 1
        top = elementBefore.info.top
        const itemStartLeft = x / gridPixelSize + offSetLeft
        const itemStartTop = y / gridPixelSize + offSetTop
        marginLeft = itemStartLeft - left
        marginTop = itemStartTop - top
    } else {
        left = 0
        top = 0
        const itemStartLeft = x / gridPixelSize + offSetLeft
        const itemStartTop = y / gridPixelSize + offSetTop
        marginLeft = itemStartLeft - left
        marginTop = itemStartTop - top
    }
    console.log("marginLeft, marginTop", marginLeft, marginTop)
    console.log("left, top", left, top)
    console.log("elementBefore", elementBefore)
    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: createNewGrid(
            uuid,
            parentId,
            left,
            top,
            1,
            1,
            { top: 0, left: 0, right: 0, bottom: 0 },
            { top: marginTop, left: marginLeft, right: 0, bottom: 0 },
            gridPixelSize
        ),
    }))
    setGridChecked(uuid)
    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
