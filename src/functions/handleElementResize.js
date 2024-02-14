import { produce } from "immer"
import calculateNewStyle from "./calculateNewStyle"

export default function handleElementResize(gridMoving, allElements, setGridMoving, setAllElements) {
    let { top, left, width, height } = allElements[gridMoving.id]
    console.log({ top, left, width, height })
    let deltaX = gridMoving.x2 - gridMoving.x1
    let deltaY = gridMoving.y2 - gridMoving.y1
    // Handle creating and resizing-1
    if (gridMoving.type === "creating") {
        width += deltaX
        height += deltaY
    } else if (gridMoving.type === "resizing-1") {
        top += deltaY
        height -= deltaY
        left += deltaX
        width -= deltaX
    }
    // Implement resizing for the rest of the directions
    else if (gridMoving.type === "resizing-5") {
        top += deltaY
        height -= deltaY
    } else if (gridMoving.type === "resizing-2") {
        top += deltaY
        height -= deltaY
        width += deltaX
    } else if (gridMoving.type === "resizing-6") {
        width += deltaX
    } else if (gridMoving.type === "resizing-3") {
        width += deltaX
        height += deltaY
    } else if (gridMoving.type === "resizing-7") {
        height += deltaY
    } else if (gridMoving.type === "resizing-4") {
        left += deltaX
        width -= deltaX
        height += deltaY
    } else if (gridMoving.type === "resizing-8") {
        left += deltaX
        width -= deltaX
    }

    // Prevent negative dimensions

    let newStyle = calculateNewStyle(left, top, width, height)

    if (gridMoving.moved === true) {
        if (height < 0) {
            top += height
            height *= -1
        }
        if (width < 0) {
            left += width
            width *= -1
        }
        newStyle = calculateNewStyle(left, top, width, height)
        setAllElements((currentState) =>
            produce(currentState, (draft) => {
                const element = draft[gridMoving.id]
                if (element) {
                    element.height = height
                    element.width = width
                    element.top = top
                    element.left = left
                    element.style = {
                        ...element.style,
                        ...newStyle,
                        gridTemplateColumns: `repeat(${width}, 1px)`,
                        gridTemplateRows: `repeat(${height}, 1px)`,
                    }
                }
            })
        )
        setGridMoving({ moving: false })
        return
    }
    setAllElements((currentState) =>
        produce(currentState, (draft) => {
            const element = draft[gridMoving.id]
            if (element) {
                element.height = height
                element.width = width
                element.top = top
                element.left = left
                element.style = {
                    ...element.style,
                    ...newStyle,
                    gridTemplateColumns: `repeat(${width}, 1px)`,
                    gridTemplateRows: `repeat(${height}, 1px)`,
                }
            }
        })
    )

    setGridMoving((i) => ({ ...i, setBox: true }))
}
