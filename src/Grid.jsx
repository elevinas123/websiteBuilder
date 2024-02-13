import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { allElementsAtom, cursorTypeAtom, gridCheckedAtom, gridMovingAtom, startElementBoundingBoxAtom } from "./atoms"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleElementResize from "./functions/handleElementResize"
import startElementInteraction from "./functions/startElementInteraction"
export default function Grid(props) {
    const gridRef = useRef(null)
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [startElementBoundingBox, setStartingElementBoundingBox] = useAtom(startElementBoundingBoxAtom)
    const selecteCursorType = {
        moving: "cursor-default",
        resizing: "cursor-ne-resize",
        resizingH: "cursor-n-resize",
        resizingT: "cursor-s-resize",
        creating: "cursor-default",
    }

    useEffect(() => {
        // Check if the props.id matches the ID of this item
        if (props.id === gridChecked && gridChecked !== "" && !gridSelect) {
            setGridSelect(true)
        } else {
            setGridSelect(false)
        }
    }, [gridChecked, props.id])

    useEffect(() => {
        if (gridMoving.id === props.id && gridMoving.moving && !gridMoving.setBox) {
            if (gridMoving.type === "moving") {
                handleGridMove(gridMoving, allElements, setGridMoving, setAllElements)
            } else if (gridMoving.type === "creating" || gridMoving.type === "resizing" || gridMoving.type == "resizingW" || gridMoving.type === "resizingH") {
                handleElementResize(gridMoving, allElements, setGridMoving, setAllElements)
            }
        }
    }, [gridMoving])

    const handleMouseDown = (event) => {
        event.stopPropagation()
        console.log(startElementBoundingBox)
        console.log(event.clientX)
        const mouseX = event.clientX - startElementBoundingBox.left
        const mouseY = event.clientY - startElementBoundingBox.top
        if (gridMoving.id !== props.id) {
            setGridChecked("")
        }
        if (cursorType === "moving" && !props.mainGrid) {
            setGridChecked(props.id)

            startElementInteraction(props.id, mouseX, mouseY, cursorType, setGridMoving)
            return
        }
        if (cursorType == "creating") {
            setGridChecked(props.id)
            startCreatingElement(mouseX, mouseY, props.id, allElements, setGridMoving, setAllElements)
            return
        }
    }

    const handleMouseUp = (event) => {
        event.stopPropagation()
        const mouseX = event.clientX - startElementBoundingBox.left
        const mouseY = event.clientY - startElementBoundingBox.top
        setGridMoving((i) => ({ ...i, x2: mouseX, y2: mouseY, moved: true }))
        return
    }

    const handleResizeMouseDown = (event) => {
        event.stopPropagation()
        const mouseX = event.clientX - startElementBoundingBox.left
        const mouseY = event.clientY - startElementBoundingBox.top
        if (gridMoving.id !== props.id) {
            setGridChecked("")
        }
        const position = event.target.id
        let cType = "resizing"
        if (position == 5 || position == 7) {
            cType = "resizingH"
        } else if (position == 6 || position == 8) {
            cType = "resizingW"
        }

        startElementInteraction(props.id, mouseX, mouseY, cType, setGridMoving)
    }

    return (
        <div
            ref={gridRef}
            style={allElements[props.id].style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`relative z-10 grid h-full w-full select-none   ${gridMoving.id === props.id ? selecteCursorType[cursorType] : ""} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {allElements[props.id].children.length > 0 && allElements[props.id].children.map((i) => allElements[i].item)}
            {allElements[props.id].text}
            {gridChecked === props.id && !props.mainGrid ? (
                <div className="absolute h-full w-full ">
                    <div
                        className=" absolute -left-1 -top-1 z-50 h-2 w-2 cursor-nw-resize border border-red-500 bg-white opacity-100 "
                        id={1}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute -right-1 -top-1 z-50 h-2 w-2 cursor-ne-resize border border-red-500 bg-white opacity-100 "
                        id={2}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -right-1 z-50 h-2 w-2 cursor-se-resize border border-red-500 bg-white opacity-100 "
                        id={3}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -left-1 z-50 h-2 w-2 cursor-sw-resize border border-red-500 bg-white opacity-100 "
                        id={4}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div className="absolute -top-0.5 left-0 right-0 h-1 cursor-n-resize bg-blue-400" id="5" onMouseDown={handleResizeMouseDown}></div>
                    <div className="absolute -right-0.5 bottom-0 top-0 z-10 w-1 cursor-e-resize bg-blue-400" id="6" onMouseDown={handleResizeMouseDown}></div>
                    <div className="absolute -bottom-0.5 left-0 right-0 z-10 h-1 cursor-s-resize  bg-blue-400" id="7" onMouseDown={handleResizeMouseDown}></div>
                    <div className="absolute -left-0.5 bottom-0 top-0 z-10 w-1  cursor-w-resize bg-blue-400" id="8" onMouseDown={handleResizeMouseDown}></div>
                </div>
            ) : (
                ""
            )}
        </div>
    )
}
