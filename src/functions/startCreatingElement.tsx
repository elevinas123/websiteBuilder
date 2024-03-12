import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"
import { createNewGrid } from "./gridCRUD"
import { AllElements, GridElement, SetAllElements } from "../Types"
import { SetGridChecked, SetGridMoving } from "../atoms"

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
    setAllElements: SetAllElements,
    setGridChecked: SetGridChecked
) {
    const uuid = uuidv4()
    let offSetLeft = mainGridOffset.left
    let offSetTop = mainGridOffset.top
    let pId: string | null = parentId
    while (pId !== null) {
        const ell: GridElement = allElements[pId]
        offSetLeft -= ell.info.left + ell.info.padding.left + ell.info.border.borderLeft.borderWidth -1
        offSetTop -= ell.info.top + ell.info.padding.top + ell.info.border.borderTop.borderWidth - 1
        pId = ell.parent
    }
    const left = x / gridPixelSize + offSetLeft 
    const top = y / gridPixelSize + offSetTop 
    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: createNewGrid(uuid, parentId, left, top, 1, 1, { top: 0, left: 0, right: 0, bottom: 0 }, gridPixelSize),
    }))
    setGridChecked(uuid)
    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
