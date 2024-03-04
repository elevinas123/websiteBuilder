import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import {
    HistoryClassAtom,
    allElementsAtom,
    allPositionsAtom,
    cursorTypeAtom,
    gridCheckedAtom,
    gridMovingAtom,
    gridPixelSizeAtom,
    intersectionLinesAtom,
    mainGridIdAtom,
    mainGridOffsetAtom,
    mainGridRefAtom,
    startElementBoundingBoxAtom,
} from "./atoms"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleElementResize from "./functions/handleElementResize"
import startElementInteraction from "./functions/startElementInteraction"
import handlePaddingResize from "./functions/handlePaddingresize"
export default function Grid(props) {
    const gridRef = useRef(null)
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [startElementBoundingBox, setStartingElementBoundingBox] = useAtom(startElementBoundingBoxAtom)
    const [gridPixelSize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [mainGridOffset, setMainGridOffset] = useAtom(mainGridOffsetAtom)
    const [mainGridId, setMainGridId] = useAtom(mainGridIdAtom)
    const [HistoryClass, setHistoryClass] = useAtom(HistoryClassAtom)
    const [allPositions, setAllPositions] = useAtom(allPositionsAtom)
    const [intersectionLines, setIntersectionLines] = useAtom(intersectionLinesAtom)
    const [lines, setLines] = useState([])
    const selecteCursorType = {
        moving: "cursor-default",
        "grid-moving": "cursor-grabbing",
        resizing: "cursor-ne-resize",
        resizingH: "cursor-n-resize",
        resizingT: "cursor-s-resize",
        creating: "cursor-default",
    }
    useEffect(() => {
        console.log("children changed", props.id)
    }, [allElements[props.id].children])

    useEffect(() => {
        // Check if the props.id matches the ID of this item
        if (props.id === gridChecked && gridChecked !== "" && !gridSelect) {
            setGridSelect(true)
        } else {
            setGridSelect(false)
        }
    }, [gridChecked, props.id])
    useEffect(() => {}, [allElements[props.id].style])
    useEffect(() => {
        if (props.id !== mainGridId) return
        console.log("intersectionLines", intersectionLines)
        let absLines = intersectionLines.map((line, index) =>
            line.type === "horizontal" ? (
                <div
                    key={`line-${index}`}
                    style={{
                        zIndex: 100,
                        position: "absolute",
                        left: `${line.start * gridPixelSize}px`,
                        width: `${(line.end - line.start) * gridPixelSize}px`,
                        top: `${line.at * gridPixelSize}px`,
                        height: `${4 / gridPixelSize}px`,
                        backgroundColor: "red", // Choose a color that stands out
                    }}
                />
            ) : (
                <div
                    key={`line-${index}`}
                    style={{
                        zIndex: 100,
                        position: "absolute",
                        top: `${line.start * gridPixelSize}px`,
                        height: `${(line.end - line.start) * gridPixelSize}px`,
                        left: `${line.at * gridPixelSize}px`,
                        width: `${4 / gridPixelSize}px`,
                        backgroundColor: "red", // Choose a color that stands out
                    }}
                />
            )
        )
        console.log("lines", absLines)
        setLines(absLines)
    }, [intersectionLines])
    useEffect(() => {
        if (gridMoving.id === props.id && gridMoving.moving && !gridMoving.setBox) {
            if (gridMoving.type === "moving") {
                handleGridMove(
                    gridMoving,
                    allElements,
                    gridPixelSize,
                    HistoryClass,
                    allPositions,
                    setGridMoving,
                    setAllElements,
                    setAllPositions,
                    setIntersectionLines
                )
            } else if (gridMoving.type === "grid-moving") {
                if (!props.mainRef) return

                setMainGridOffset((i) => ({
                    ...i,
                    left: Math.max(0, i.left - (gridMoving.x2 - gridMoving.x1) / gridPixelSize),
                    top: Math.max(0, i.top - (gridMoving.y2 - gridMoving.y1) / gridPixelSize),
                }))
                if (gridMoving.moved) {
                    setGridMoving({ moving: false })
                    HistoryClass.performAction(allElements)
                    console.log(HistoryClass.currentNode)
                } else setGridMoving((i) => ({ ...i, setBox: true }))
            } else {
                if (cursorType === "padding") {
                    handlePaddingResize(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements, setCursorType)
                    return
                }
                handleElementResize(
                    gridMoving,
                    allElements,
                    gridPixelSize,
                    HistoryClass,
                    allPositions,
                    setGridMoving,
                    setAllElements,
                    setCursorType,
                    setAllPositions
                )
            }
        }
    }, [gridMoving])
    useEffect(() => {
        if (!props.mainRef) return
        props.mainRef.current.scrollTop = mainGridOffset.top * gridPixelSize
        props.mainRef.current.scrollLeft = mainGridOffset.left * gridPixelSize
    }, [mainGridOffset])

    const handleMouseDown = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const mouseX = event.clientX - startElementBoundingBox.left
        const mouseY = event.clientY - startElementBoundingBox.top
        if (gridMoving.id !== props.id) {
            setGridChecked("")
        }
        if (event.button === 1) {
            startElementInteraction(mainGridId, mouseX, mouseY, "grid-moving", setGridMoving)
            return
        }
        if (cursorType === "padding") {
            const type = event.target.id
            setGridChecked(props.id)

            setGridChecked(props.id)

            startElementInteraction(props.id, mouseX, mouseY, type, setGridMoving)
            console.log(gridChecked)
            console.log(cursorType)
            return
        }
        if (cursorType === "moving" && props.id !== mainGridId) {
            const position = event.target.id
            let currCursorType = cursorType
            if (position) {
                currCursorType = "resizing-" + position
            }
            setGridChecked(props.id)

            startElementInteraction(props.id, mouseX, mouseY, currCursorType, setGridMoving)
            return
        }
        if (cursorType == "creating") {
            startCreatingElement(mouseX, mouseY, props.id, allElements, mainGridOffset, gridPixelSize, setGridMoving, setAllElements, setGridChecked)
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

    return (
        <div
            ref={gridRef}
            style={allElements[props.id].style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`relative z-10 box-content grid h-full w-full  select-none   ${selecteCursorType[cursorType]} ${gridSelect && cursorType !== "padding" ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {/* Conditionally render the padding resize handles if padding is being adjusted or is non-zero */}
            {(Object.values(allElements[props.id].padding).some((value) => value > 0) || (cursorType === "padding" && gridChecked === props.id)) && (
                <div className="pointer-events-none absolute h-full w-full">
                    {/* Padding area rectangle with resize handles */}
                    <div
                        className="pointer-events-auto absolute border-2 border-dashed border-blue-500"
                        style={{
                            top: `${allElements[props.id].padding.top * gridPixelSize}px`,
                            right: `${allElements[props.id].padding.right * gridPixelSize}px`,
                            bottom: `${allElements[props.id].padding.bottom * gridPixelSize}px`,
                            left: `${allElements[props.id].padding.left * gridPixelSize}px`,
                        }}
                    >
                        {/* Top resize handle */}
                        <div
                            className="absolute left-0 right-0 top-0 h-2 cursor-n-resize"
                            id="padding-top"
                            onMouseDown={handleMouseDown}
                            style={{ top: "-2px" }}
                        ></div>

                        {/* Right resize handle */}
                        <div
                            className="absolute bottom-0 right-0 top-0 w-2 cursor-e-resize"
                            id="padding-right"
                            onMouseDown={handleMouseDown}
                            style={{ right: "-2px" }}
                        ></div>

                        {/* Bottom resize handle */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize"
                            id="padding-bottom"
                            onMouseDown={handleMouseDown}
                            style={{ bottom: "-2px" }}
                        ></div>

                        {/* Left resize handle */}
                        <div
                            className="absolute bottom-0 left-0 top-0 w-2 cursor-w-resize"
                            id="padding-left"
                            onMouseDown={handleMouseDown}
                            style={{ left: "-2px" }}
                        ></div>
                    </div>
                </div>
            )}
            {lines}
            {allElements[props.id].children.map((i) => allElements[i].item)}
            {allElements[props.id].text}
            {props.id === "main"}
            {gridChecked === props.id && !props.mainGrid && cursorType !== "padding" ? (
                <div className="absolute h-full w-full ">
                    <div
                        className=" absolute -left-1 -top-1 z-50 h-2 w-2 cursor-nw-resize border border-red-500 bg-white opacity-100 "
                        id={1}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -right-1 -top-1 z-50 h-2 w-2 cursor-ne-resize border border-red-500 bg-white opacity-100 "
                        id={2}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -right-1 z-50 h-2 w-2 cursor-se-resize border border-red-500 bg-white opacity-100 "
                        id={3}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -left-1 z-50 h-2 w-2 cursor-sw-resize border border-red-500 bg-white opacity-100 "
                        id={4}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div className="absolute -top-0.5 left-0 right-0 h-1 cursor-n-resize bg-blue-400" id="5" onMouseDown={handleMouseDown}></div>
                    <div className="absolute -right-0.5 bottom-0 top-0 z-10 w-1 cursor-e-resize bg-blue-400" id="6" onMouseDown={handleMouseDown}></div>
                    <div className="absolute -bottom-0.5 left-0 right-0 z-10 h-1 cursor-s-resize  bg-blue-400" id="7" onMouseDown={handleMouseDown}></div>
                    <div className="absolute -left-0.5 bottom-0 top-0 z-10 w-1  cursor-w-resize bg-blue-400" id="8" onMouseDown={handleMouseDown}></div>
                </div>
            ) : (
                ""
            )}
        </div>
    )
}
