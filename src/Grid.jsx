import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { cursorTypeAtom, gridCheckedAtom, gridMovingAtom } from "./atoms"
import startMovingElement from "./functions/startMovingElement"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleGridCreation from "./functions/handleGridCreation"
export default function Grid(props) {
    const gridRef = useRef(null)
    const gridSizeX = 300
    const gridSizeY = 300
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [style, setStyle] = useState({})
    const [elements, setElements] = useState([])
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    useEffect(() => {
        console.log("size setting", props.size)
        if (!props.size) return
        setSize(props.size)
    }, [props.size])
    useEffect(() => {
        console.log("elements", props.level, elements)
    }, [elements])

    useEffect(() => {
        // Check if the props.id matches the ID of this item

        if (props.id === gridChecked && gridChecked !== "" && !gridSelect) {
            setGridSelect(true)
        } else {
            setGridSelect(false)
        }
    }, [gridChecked, props.id])

    useEffect(() => {
        if (!props.childStyle) {
            return
        }
        setStyle(props.childStyle)
    }, [props.childStyle])

    useEffect(() => {
        if (gridMoving.id === props.id && gridMoving.moving && (!gridMoving.setBox || gridMoving.moved)) {
            if (gridMoving.type === "moving") {
                console.log("sizew", size, props.level)
                handleGridMove(
                    gridMoving,
                    size.width,
                    size.height,
                    props.parentRef,
                    props.parentSizeX,
                    props.parentSizeY,
                    props.parentProps,
                    setStyle,
                    setElements,
                    setGridMoving,
                    props.setParentElements,
                    props.setGrandParentElements
                )
            } else if (gridMoving.type === "creating") {
                handleGridCreation(
                    gridMoving,
                    0,
                    0,
                    gridRef,
                    gridSizeX,
                    gridSizeY,
                    props.parentProps,
                    setStyle,
                    setElements,
                    setGridMoving,
                    props.setParentElements,
                    props.setGrandParentElements
                )
            }
        }
    }, [gridMoving])

    const handleMouseDown = (event) => {
        event.stopPropagation()
        if (cursorType === "moving" && props.level !== 0) {
            setGridChecked(props.id)
            console.log("starting size", size)
            startMovingElement(event, gridRef, size, props.id, "moving", setGridMoving)
            return
        }
        if (cursorType == "creating") {
            startCreatingElement(event, gridRef, gridSizeX, gridSizeY, props.level, props.id, props, setGridMoving, setElements, props.setParentElements)
            return
        }
    }

    const handleMouseUp = (e) => {
        e.stopPropagation()
        console.log("cia123")
        console.log("grid before mouse up", gridMoving)
        setGridMoving((i) => ({ ...i, x2: e.clientX, y2: e.clientY, moved: true }))
        return
    }

    return (
        <div
            style={style}
            ref={gridRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`grid h-full w-full select-none hover:border-blue-500 ${`grid-cols-300`} ${`grid-rows-300`} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {elements}
        </div>
    )
}
