import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"

export default function startCreatingElement(x, y, parentId, allElements, mainGridOffset, gridPixelSize, setGridMoving, setAllElements, setGridChecked) {
    const uuid = uuidv4()
    let offSetLeft = mainGridOffset.left
    let offSetTop = mainGridOffset.top
    let pId = parentId
    while (pId !== null) {
        let ell = allElements[pId]
        offSetLeft -= ell.left
        offSetTop -= ell.top
        pId = ell.parent
    }
    const newStyle = calculateNewStyle(x / gridPixelSize + offSetLeft, y / gridPixelSize + offSetTop, 1, 1, gridPixelSize)

    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: {
            item: <Grid key={uuid} className="bg-red-500" id={uuid} childStyle={newStyle}></Grid>,
            id: uuid,
            width: 1,
            height: 1,
            left: x / gridPixelSize + offSetLeft,
            top: y / gridPixelSize + offSetTop,
            css: {
                width: "w-1",
                height: "h-1",
            },
            style: newStyle,
            text: "",
            parent: parentId,
            children: [],
        },
    }))
    setGridChecked(uuid)
    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
