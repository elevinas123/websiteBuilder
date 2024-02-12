import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { allElementsAtom, allRefsAtom, cursorTypeAtom, gridCheckedAtom, gridMovingAtom } from "./atoms"
import startMovingElement from "./functions/startMovingElement"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleGridCreation from "./functions/handleGridCreation"
import getBoundingBox from "./functions/getBoundingBox"
import handleElementResize from "./functions/handleElementResize"
import startResizingElement from "./functions/startResizingElement"
export default function Grid(props) {
    const gridRef = useRef(null)
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [allRefs, setAllRefs] = useAtom(allRefsAtom)
    const [style, setStyle] = useState(false)
    const selecteCursorType = {
        moving: "cursor-move",
        resizing: "cursor-ne-resize",
        resizingH: "cursor-n-resize",
        resizingT: "cursor-s-resize",
        creating: "cursor-default",
    }

    useEffect(() => {
        setAllRefs((prevRefs) => ({
            ...prevRefs,
            [props.id]: gridRef.current,
        }))
    }, [props.id, setAllRefs])

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
                handleGridMove(gridMoving, allElements[props.id].parent, allRefs, allElements, setAllElements, setGridMoving)
            } else if (gridMoving.type === "creating") {
                handleGridCreation(gridMoving, allElements[props.id].parent, allRefs, allElements, setAllElements, setGridMoving)
            } else if (gridMoving.type === "resizing" || gridMoving.type == "resizingW" || gridMoving.type === "resizingH") {
                handleElementResize(gridMoving, allElements[props.id].parent, allRefs, allElements, setAllElements, setGridMoving)
            }
        }
    }, [gridMoving])

    const handleMouseDown = (event) => {
        event.stopPropagation()
        if (cursorType === "moving" && !props.mainGrid) {
            setGridChecked(props.id)
            const element = allElements[props.id]
            const elementBoundingBox = getBoundingBox(allRefs[props.id])
            let elementInfo = {
                top: elementBoundingBox.top,
                bottom: elementBoundingBox.bottom,
                right: elementBoundingBox.right,
                left: elementBoundingBox.left,
                width: element.width,
                height: element.height,
                gridSize: element.gridSize,
            }
            startMovingElement(event, props.id, props.id, elementInfo, allRefs, "moving", allElements, setGridMoving)
            return
        }
        if (cursorType == "creating") {
            startCreatingElement(event, props.id, allRefs, allElements, setGridMoving, setAllElements)
            return
        }
    }

    const handleMouseUp = (event) => {
        event.stopPropagation()
        setGridMoving((i) => ({ ...i, x2: event.clientX, y2: event.clientY, moved: true }))
        return
    }
    const handleResizeMouseDown = (event) => {
        event.stopPropagation()
        const element = allElements[props.id]
        const elementBoundingBox = getBoundingBox(allRefs[props.id])
        const position = event.target.id
        let cType = "resizing"
        if (position == 5 || position == 7) {
            cType = "resizingH"
        } else if (position == 6 || position == 8) {
            cType = "resizingW"
        }
        console.log("asdasdasd", position)
        let elementInfo = {
            top: elementBoundingBox.top,
            bottom: elementBoundingBox.bottom,
            right: elementBoundingBox.right,
            left: elementBoundingBox.left,
            width: element.width,
            height: element.height,
            gridSize: element.gridSize,
        }
        startResizingElement(event, props.id, props.id, elementInfo, allRefs, cType, position, setGridMoving)
    }

    return (
        <div
            ref={gridRef}
            style={allElements[props.id].style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`relative grid h-full w-full select-none  ${`grid-cols-1000`} ${`grid-rows-1000`} ${gridMoving.id === props.id ? selecteCursorType[cursorType] : ""} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {allElements[props.id].children.length > 0 && allElements[props.id].children.map((i) => allElements[i].item)}
            {gridChecked === props.id && !props.mainGrid ? (
                <div className="absolute h-full w-full bg-blue-300 opacity-65">
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
                    <div
                        className="absolute left-1/2 top-0 z-50 h-2 w-2 -translate-x-1/2 -translate-y-1 transform cursor-n-resize border border-red-500 bg-white opacity-100"
                        id={5}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute right-0 top-1/2 z-50 h-2 w-2 -translate-x-1 -translate-y-1/2 transform cursor-e-resize border border-red-500 bg-white opacity-100"
                        id={6}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute bottom-0 left-1/2 z-50 h-2 w-2 -translate-x-1/2 -translate-y-1 transform cursor-s-resize border border-red-500 bg-white opacity-100"
                        id={7}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute left-0 top-1/2 z-50 h-2 w-2 -translate-x-1 -translate-y-1/2 transform cursor-w-resize border border-red-500 bg-white opacity-100"
                        id={8}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                </div>
            ) : (
                ""
            )}
        </div>
    )
}
