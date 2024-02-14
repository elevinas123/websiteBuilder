import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import startElementInteraction from "./startElementInteraction"
import calculateNewStyle from "./calculateNewStyle"

export default function startCreatingElement(x, y, parentId, allElements, mainGridOffset, setGridMoving, setAllElements) {
    const uuid = uuidv4()
    console.log(x, y, parentId, setGridMoving, setAllElements)
    const newStyle = calculateNewStyle(x, y, 1, 1)
    console.log(newStyle)

    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements[parentId].children, uuid] },
        [uuid]: {
            item: <Grid key={uuid} className="bg-red-500" id={uuid} childStyle={newStyle}></Grid>,
            id: uuid,
            width: 1,
            height: 1,
            left: x  + mainGridOffset.left,
            top: y   + mainGridOffset.top,
            style: newStyle,
            text: "",
            parent: parentId,
            children: [],
        },
    }))

    startElementInteraction(uuid, x, y, "creating", setGridMoving)
}
