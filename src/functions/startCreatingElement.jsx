import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"

export default function startCreatingElement(x, y, parentId, allElements, mainGridOffset, gridPixelSize, setGridMoving, setAllElements, setGridChecked) {
    const uuid = uuidv4()
    let offSetLeft = mainGridOffset.left
    let offSetTop = mainGridOffset.top
    let pId = allElements[parentId].parent
    while (pId !== null) {
        let ell = allElements[pId]
        offSetLeft -= ell.left + ell.padding.left
        offSetTop -= ell.top + ell.padding.top
        pId = ell.parent
    }
    const left = x / gridPixelSize + offSetLeft - allElements[parentId].padding.left - allElements[parentId].left
    const top = y / gridPixelSize + offSetTop - allElements[parentId].padding.top - allElements[parentId].top
    const newStyle = calculateNewStyle(left, top, 1, 1, gridPixelSize)
    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: {
            item: <Grid key={uuid} className="bg-red-500" id={uuid} childStyle={newStyle}></Grid>,
            id: uuid,
            width: 1,
            height: 1,
            left: left,
            top: top,
            css: {
                width: "w-1",
                height: "h-1",
            },
            style: newStyle,
            text: "",
            padding: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            },
            parent: parentId,
            children: [],
        },
    }))
    setGridChecked(uuid)
    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
