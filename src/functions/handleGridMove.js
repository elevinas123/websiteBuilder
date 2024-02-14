import { produce } from "immer"
import calculateMovement from "./calculateMovement"
import calculateNewStyle from "./calculateNewStyle"

export default function handleElementResize(gridMoving, allElements, setGridMoving, setAllElements) {
    let top = allElements[gridMoving.id].top
    let left = allElements[gridMoving.id].left
    const width = allElements[gridMoving.id].width
    const height = allElements[gridMoving.id].height
    const [newLeft, newtop] = calculateMovement(gridMoving, left, top)
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
