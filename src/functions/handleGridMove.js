import { produce } from "immer"
import calculateMovement from "./calculateMovement"
import calculateNewStyle from "./calculateNewStyle"

export default function handleGridMove(gridMoving, allElements, setGridMoving, setAllElements) {
    let top = allElements[gridMoving.id].top
    let left = allElements[gridMoving.id].left
    const width = allElements[gridMoving.id].width
    const height = allElements[gridMoving.id].height
    let [newLeft, newtop] = calculateMovement(gridMoving, left, top)
    const parentId = allElements[gridMoving.id].parent
    const parentInfo = {
        top: allElements[parentId].top,
        left: allElements[parentId].left,
        width: allElements[parentId].width,
        height: allElements[parentId].height,
    }
    console.log(allElements)
    console.log(gridMoving.id)
    console.log(top + height, parentInfo.height)
    if (newtop + height > parentInfo.height) {
        console.log("cia")
        newtop = parentInfo.height - height
    }
    if (newtop < 0) {
        console.log("cia")
        newtop = 0 
    }
    if (newLeft + width > parentInfo.width) {
        console.log("cia")
        newLeft = parentInfo.width - width
    }
    if (newLeft < 0) {
        console.log("cia")
        newLeft = 0
    }
    console.log(newtop)
    const newStyle = calculateNewStyle(newLeft, newtop, width, height)
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            // Update the parent element
            const element = draft[gridMoving.id]
            if (element) {
                element.top = newtop
                element.left = newLeft
                element.style = {
                    ...element.style,
                    ...newStyle,
                }
            }
        })
    )

    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        return
    }
    setGridMoving((i) => ({ ...i, setBox: true }))
}
