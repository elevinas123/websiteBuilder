import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"
import calculateMovement from "./calculateMovement"

export default function handleElementResize(gridMoving, allElements, setGridMoving, setAllElements) {
    let { top, left, width, height } = allElements[gridMoving.id]
    console.log(top, left)
    console.log("top, left", top, left)

    let [newWidth, newHeight] = calculateMovement(gridMoving, width, height)
    console.log("newasda", newWidth, newHeight)

    let newStyle = calculateNewStyle(left, top, newWidth, newHeight)
    console.log(newStyle)
    if (gridMoving.moved === true) {
        setGridMoving({ moving: false })
        if (newHeight < 0) {
            top +=newHeight
            newHeight *= -1;
        }
        if (newWidth < 0) {
            top += newWidth
            newWidth *= -1
        }
        setAllElements((currentState) =>
            produce(currentState, (draft) => {
                // Update the parent element
                const element = draft[gridMoving.id]
                if (element) {
                    element.height = newHeight
                    element.width = newWidth
                    element.top = top
                    element.left = left
                    element.style = {
                        ...element.style,
                        ...newStyle,
                        gridTemplateColumns: `repeat(${newWidth}, 1px)`, // 10 columns, each 4px wide
                        gridTemplateRows: `repeat(${newHeight}, 1px)`,
                    }
                }
            })
        )
        return
    }
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            // Update the parent element
            const element = draft[gridMoving.id]
            if (element) {
                element.height = newHeight
                element.width = newWidth
                element.top = top
                element.left = left
                element.style = {
                    ...element.style,
                    ...newStyle,
                    gridTemplateColumns: `repeat(${newWidth}, 1px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${newHeight}, 1px)`,
                }
            }
        })
    )

    setGridMoving((i) => ({ ...i, setBox: true }))
}
