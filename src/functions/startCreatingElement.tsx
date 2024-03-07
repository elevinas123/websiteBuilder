import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"
import { createNewGrid } from "./gridCRUD"
import { AllElements, GridElement } from "../Types"
import { SetGridMoving } from "../atoms"

interface MainGridOffset {
    left: number,
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
    setAllElements,
    setGridChecked
) {
    const uuid = uuidv4()
    let offSetLeft = mainGridOffset.left
    let offSetTop = mainGridOffset.top
    let pId = allElements[parentId].parent
    while (pId !== null) {
        let ell = allElements[pId]
        offSetLeft -= ell.info.left + ell.info.padding.left
        offSetTop -= ell.info.top + ell.info.padding.top
        pId = ell.parent
    }
    const left = x / gridPixelSize + offSetLeft - allElements[parentId].info.padding.left - allElements[parentId].info.left
    const top = y / gridPixelSize + offSetTop - allElements[parentId].info.padding.top - allElements[parentId].info.top
    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: createNewGrid(uuid, parentId, left, top, 1, 1, { top: 0, left: 0, right: 0, bottom: 0 }, gridPixelSize),
    }))
    setGridChecked(uuid)
    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
