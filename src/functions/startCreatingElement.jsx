import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"

export default function startCreatingElement(x, y, parentId, allElements, mainGridOffset, gridPixelSize, setGridMoving, setAllElements) {
    const uuid = uuidv4()
    const newStyle = calculateNewStyle(x, y, 1, 1)
    let offSetLeft = mainGridOffset.left
    let offSetTop = mainGridOffset.top
    let pId = parentId
    while (pId !== null) {
        let ell = allElements[pId]
        offSetLeft -=ell.left
        offSetTop -= ell.top
        pId = ell.parent
    }
    console.log(offSetLeft)
    console.log(offSetTop)
    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: {
            item: <Grid key={uuid} className="bg-red-500" id={uuid} childStyle={newStyle}></Grid>,
            id: uuid,
            width: 1,
            height: 1,
            left: (x + offSetLeft) / gridPixelSize,
            top: (y + offSetTop) / gridPixelSize,
            style: newStyle,
            text: "",
            parent: parentId,
            children: [],
        },
    }))

    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
