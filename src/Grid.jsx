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
            } else if (gridMoving.type === "resizing") {
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
        let elementInfo = {
            top: elementBoundingBox.top,
            bottom: elementBoundingBox.bottom,
            right: elementBoundingBox.right,
            left: elementBoundingBox.left,
            width: element.width,
            height: element.height,
            gridSize: element.gridSize,
        }
        startResizingElement(event, props.id, props.id, elementInfo, allRefs, "resizing", position, setGridMoving)
    }

    return (
        <div
            ref={gridRef}
            style={allElements[props.id].style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`relative grid h-full w-full select-none  ${`grid-cols-1000`} ${`grid-rows-1000`} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {allElements[props.id].children.length > 0 && allElements[props.id].children.map((i) => allElements[i].item)}
            {gridChecked === props.id && !props.mainGrid ? (
                <div className="absolute h-full w-full bg-blue-300 opacity-65">
                    <div
                        className=" absolute -left-1 -top-1 z-50 h-2 w-2 cursor-nesw-resize border border-red-500 bg-white opacity-100 "
                        id={1}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute -right-1 -top-1 z-50 h-2 w-2 cursor-nesw-resize border border-red-500 bg-white opacity-100 "
                        id={2}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -right-1 z-50 h-2 w-2 cursor-nesw-resize border border-red-500 bg-white opacity-100 "
                        id={3}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -left-1 z-50 h-2 w-2 cursor-nesw-resize border border-red-500 bg-white opacity-100 "
                        id={4}
                        onMouseDown={handleResizeMouseDown}
                    ></div>
                </div>
            ) : (
                ""
            )}
        </div>
    )
}
