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
    mainGridIdAtom,
    mainGridOffsetAtom,
    startElementBoundingBoxAtom,
    visualsUpdatedAtom,
} from "./atoms"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleElementResize from "./functions/handleElementResize"
import startElementInteraction from "./functions/startElementInteraction"
import handlePaddingResize from "./functions/handlePaddingresize"
import handleBorderResize from "./functions/handleBorderResize"
import handleMarginResize from "./functions/handleMarginResize"

interface GridProps {
    key: string
    id: string
    childStyle: React.CSSProperties
    mainGrid?: string
    mainRef?: any
    className?: string
}

const Grid: React.FC<GridProps> = (props: GridProps) => {
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
    const [visualsUpdate, setVisualsUpdated] = useAtom(visualsUpdatedAtom)

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
    useEffect(() => {
        console.log(allElements)
    }, [visualsUpdate])

    useEffect(() => {
        if (gridMoving.id === props.id && gridMoving.moving && !gridMoving.setBox) {
            console.log("gridMoing.type", gridMoving, props)
            if (gridMoving.type === "moving") {
                handleGridMove(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements)
                setVisualsUpdated((i) => ({ count: i.count + 1, id: gridMoving.id }))
            } else if (gridMoving.type === "grid-moving") {
                if (!props.mainRef) return
                console.log("cia")
                setMainGridOffset((i) => ({
                    ...i,
                    left: Math.max(0, i.left - (gridMoving.x2 - gridMoving.x1) / gridPixelSize),
                    top: Math.max(0, i.top - (gridMoving.y2 - gridMoving.y1) / gridPixelSize),
                }))
                if (gridMoving.moved) {
                    setGridMoving((i) => ({ ...i, moving: false }))
                    HistoryClass.performAction(allElements)

                    console.log(HistoryClass.currentNode)
                } else setGridMoving((i) => ({ ...i, setBox: true }))
            } else if (cursorType === "margin") {
                handleMarginResize(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements)
                setVisualsUpdated((i) => ({ count: i.count + 1, id: gridMoving.id }))
            } else if (cursorType === "padding") {
                handlePaddingResize(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements)
                setVisualsUpdated((i) => ({ count: i.count + 1, id: gridMoving.id }))
                return
            } else if (cursorType === "border") {
                handleBorderResize(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements)
                setVisualsUpdated((i) => ({ count: i.count + 1, id: gridMoving.id }))
            } else {
                handleElementResize(gridMoving, allElements, gridPixelSize, HistoryClass, setGridMoving, setAllElements, setCursorType)
                setVisualsUpdated((i) => ({ count: i.count + 1, id: gridMoving.id }))
            }
        }
    }, [gridMoving])
    useEffect(() => {
        if (!props.mainRef) return
        props.mainRef.current.scrollTop = mainGridOffset.top * gridPixelSize
        props.mainRef.current.scrollLeft = mainGridOffset.left * gridPixelSize
    }, [mainGridOffset])

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const mouseX = event.clientX - startElementBoundingBox.left
        const mouseY = event.clientY - startElementBoundingBox.top
        const target = event.target as HTMLElement
        const type = target.id
        console.log("event", event)
        if (gridMoving.id !== props.id) {
            setGridChecked("")
        }
        if (event.button === 1) {
            startElementInteraction(mainGridId, mouseX, mouseY, "grid-moving", setGridMoving)
            console.log("started")
            return
        }
        if (cursorType === "padding") {
            setGridChecked(props.id)

            setGridChecked(props.id)

            startElementInteraction(props.id, mouseX, mouseY, type, setGridMoving)
            console.log(gridChecked)
            console.log(cursorType)
            return
        }
        if (cursorType === "border") {
            setGridChecked(props.id)

            setGridChecked(props.id)

            startElementInteraction(props.id, mouseX, mouseY, type, setGridMoving)
            console.log(gridChecked)
            console.log(cursorType)
            return
        }
        console.log("type", type)
        if (type.split("-")[0] === "margin") {
            startElementInteraction(props.id, mouseX, mouseY, type, setGridMoving)
        }
        if (cursorType === "moving" && props.id !== mainGridId) {
            let currCursorType: string = cursorType
            if (type) {
                currCursorType = type
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

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = (event) => {
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
            className={`relative z-10  select-none `}
        >
            {/* Conditionally render the padding resize handles if padding is being adjusted or is non-zero */}
            {(Object.values(allElements[props.id].info.padding).some((value) => value > 0) ||
                ((cursorType === "padding" || cursorType === "border") && gridChecked === props.id)) && (
                <div className="pointer-events-none absolute h-full w-full">
                    {/* Padding area rectangle with resize handles */}
                    <div
                        className="pointer-events-auto absolute border-2 border-dashed border-blue-500"
                        style={{
                            top: `${allElements[props.id].info.padding.top * gridPixelSize}px`,
                            right: `${allElements[props.id].info.padding.right * gridPixelSize}px`,
                            bottom: `${allElements[props.id].info.padding.bottom * gridPixelSize}px`,
                            left: `${allElements[props.id].info.padding.left * gridPixelSize}px`,
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
            {allElements[props.id].children.map((i) => allElements[i].item)}
            {allElements[props.id].text}
            {props.id !== "main-webGrid" && (
                <div
                    className="absolute top-1/2 cursor-e-resize border-t-2 border-dashed border-t-green-500"
                    style={{
                        height: "2px", // Ensures the line has a visible thickness
                        width: allElements[props.id].info.margin.left * gridPixelSize + "px", // Sets the width of the line
                        left: (-allElements[props.id].info.margin.left - allElements[props.id].info.border.borderLeft.borderWidth) * gridPixelSize + "px", // Positions the line based on the margin
                    }}
                    id="margin-left"
                    onMouseDown={handleMouseDown}
                ></div>
            )}
            {props.id !== "main-webGrid" && (
                <div
                    className="absolute left-1/2 cursor-e-resize border-l-2 border-dashed border-l-green-500"
                    style={{
                        width: "2px", // Ensures the line has a visible thickness
                        height: allElements[props.id].info.margin.top * gridPixelSize + "px", // Sets the width of the line
                        top: (-allElements[props.id].info.margin.top - allElements[props.id].info.border.borderTop.borderWidth) * gridPixelSize + "px", // Positions the line based on the margin
                    }}
                    id="margin-top"
                    onMouseDown={handleMouseDown}
                ></div>
            )}
            {props.id !== "main-webGrid" && (
                <div
                    className="absolute top-1/2 cursor-e-resize border-t-2 border-dashed border-t-blue-500"
                    style={{
                        height: "2px", // Ensures the line has a visible thickness
                        width: allElements[props.id].info.margin.right * gridPixelSize + "px", // Sets the width of the line
                        right: (-allElements[props.id].info.margin.right - allElements[props.id].info.border.borderRight.borderWidth) * gridPixelSize + "px", // Positions the line based on the margin
                    }}
                    id="margin-right"
                    onMouseDown={handleMouseDown}
                ></div>
            )}

            {gridChecked === props.id && !props.mainGrid && cursorType !== "padding" && cursorType !== "border" ? (
                <div className="absolute h-full w-full ">
                    <div
                        className=" absolute -left-1 -top-1 z-50 h-2 w-2 cursor-nw-resize border border-red-500 bg-white opacity-100 "
                        id={"resizing-1"}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -right-1 -top-1 z-50 h-2 w-2 cursor-ne-resize border border-red-500 bg-white opacity-100 "
                        id={"resizing-2"}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -right-1 z-50 h-2 w-2 cursor-se-resize border border-red-500 bg-white opacity-100 "
                        id={"resizing-3"}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-1 -left-1 z-50 h-2 w-2 cursor-sw-resize border border-red-500 bg-white opacity-100 "
                        id={"resizing-4"}
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div className="absolute -top-0.5 left-0 right-0 h-1 cursor-n-resize bg-blue-400" id="resizing-5" onMouseDown={handleMouseDown}></div>
                    <div
                        className="absolute -right-0.5 bottom-0 top-0 z-10 w-1 cursor-e-resize bg-blue-400"
                        id="resizing-6"
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -bottom-0.5 left-0 right-0 z-10 h-1 cursor-s-resize  bg-blue-400"
                        id="resizing-7"
                        onMouseDown={handleMouseDown}
                    ></div>
                    <div
                        className="absolute -left-0.5 bottom-0 top-0 z-10 w-1  cursor-w-resize bg-blue-400"
                        id="resizing-8"
                        onMouseDown={handleMouseDown}
                    ></div>
                </div>
            ) : (
                ""
            )}
        </div>
    )
}

export default Grid
