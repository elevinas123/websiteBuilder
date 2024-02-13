import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { allElementsAtom, allRefsAtom, cursorTypeAtom, elementPositionsAtom, elementUpdatedAtom, gridCheckedAtom, gridMovingAtom } from "./atoms"
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
    const [elementPositions, setElementPositions] = useAtom(elementPositionsAtom)
    const [elementUpdated, setElementUpdated] = useAtom(elementUpdatedAtom)
    const selecteCursorType = {
        moving: "cursor-default",
        resizing: "cursor-ne-resize",
        resizingH: "cursor-n-resize",
        resizingT: "cursor-s-resize",
        creating: "cursor-default",
    }

    useEffect(() => {
        if (!gridRef.current) return
        const elementBoundingBox = getBoundingBox(gridRef)
        setElementPositions((i) => ({ ...i, [props.id]: elementBoundingBox }))
        setAllRefs((prevRefs) => ({
            ...prevRefs,
            [props.id]: gridRef.current,
        }))
    }, [props.id, setAllRefs, gridRef, setElementPositions])

    useEffect(() => {
        console.log("hi")
        if (!gridRef.current) return
        if (elementUpdated !== props.id) return
        console.log("labas")
        setElementPositions((currentPositions) => ({
             ...currentPositions,
             [props.id]: getBoundingBox(gridRef)
         }))
        setElementUpdated("")
    }, [elementUpdated, gridRef])

    useEffect(() => {
        // Initialize an object for child IDs and their bounding boxes
        let childrenPositions = {}
        allElements[props.id].children.forEach((id) => {
            // Assuming allRefs is a map or object where you can access refs by ID
            if (id in allRefs) {
                const ref = allRefs[id] // This needs adjustment based on how you actually access refs
                childrenPositions[id] = ref.getBoundingClientRect()
            }
        })
        // Check if the element's ID exists in elementPositions
        // Note: Using `in` operator for checking property existence in an object


        // Merge the childrenPositions into the existing elementPositions state
        setElementPositions((currentPositions) => ({
            ...currentPositions,
            ...childrenPositions,
        }))

        console.log(elementPositions) // This will log the stale state due to closure
    }, [elementPositions[props.id]]) // Removed elementPositions[props.id] due to potential ESLint error

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
                handleGridMove(gridMoving, allElements[props.id].parent, allRefs, allElements, setAllElements, setGridMoving, setElementUpdated)
            } else if (gridMoving.type === "creating") {
                handleGridCreation(gridMoving, allElements[props.id].parent, allRefs, allElements, setAllElements, setGridMoving, setElementUpdated)
            } else if (gridMoving.type === "resizing" || gridMoving.type == "resizingW" || gridMoving.type === "resizingH") {
                handleElementResize(
                    gridMoving,
                    allElements[props.id].parent,
                    allRefs,
                    allElements,
                    setAllElements,
                    setGridMoving,
                    setElementUpdated,
                    elementPositions
                )
            }
        }
    }, [gridMoving])

    const handleMouseDown = (event) => {
        event.stopPropagation()
        if (gridMoving.id !== props.id) {
            setGridChecked("")
        }
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
            setGridChecked(props.id)
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
        if (gridMoving.id !== props.id) {
            setGridChecked("")
        }
        const element = allElements[props.id]
        const elementBoundingBox = getBoundingBox(allRefs[props.id])
        const position = event.target.id
        let cType = "resizing"
        if (position == 5 || position == 7) {
            cType = "resizingH"
        } else if (position == 6 || position == 8) {
            cType = "resizingW"
        }
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
