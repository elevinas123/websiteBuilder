import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { cursorTypeAtom, gridCheckedAtom, gridMovingAtom } from "./atoms"
import startMovingElement from "./functions/startMovingElement"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleGridCreation from "./functions/handleGridCreation"
export default function Grid(props) {
    const gridRef = useRef(null)
    const gridSizeX = 100
    const gridSizeY = 100
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
        console.log("elements", elements)
    }, [elements])

    useEffect(() => {
        const gridElement = gridRef.current
        if (!gridElement) return

        // Counter to keep track of observations
        let observationCount = 0

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect
                setSize({ width, height })

                observationCount += 1
                // Unobserve after the second observation
                if (observationCount >= 2) {
                    resizeObserver.unobserve(gridElement)
                }
            }
        })

        resizeObserver.observe(gridElement)

        // Cleanup function to disconnect the observer if the component unmounts early
        return () => resizeObserver.disconnect()
    }, []) // Empty dependency array ensures this effect runs once on mount

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
                console.log("sizew", size)
                handleGridMove(
                    gridMoving,
                    size.width,
                    size.height,
                    props.parentRef,
                    props.parentGridSizeX,
                    props.parentGridSizeY,
                    setStyle,
                    setElements,
                    setGridMoving
                )
            } else if (gridMoving.type === "creating") {
                handleGridCreation(gridMoving, 0, 0, gridRef, gridSizeX, gridSizeY, setStyle, setElements, setGridMoving)
            }
        }
    }, [gridMoving])

    const unselectElement = () => {
        if (gridChecked !== props.id) {
            setGridChecked("")
            return
        }
    }

    const handleMouseDown = (event) => {
        event.stopPropagation()

        if (cursorType === "moving" && props.level !== 0) {
            console.log("starting size", size)
            startMovingElement(event, gridRef, size, props.id, "moving", setGridMoving)
            return
        }
        if (cursorType == "creating") {
            startCreatingElement(event, gridRef, gridSizeX, gridSizeY, props.level, props.id, setGridMoving, setElements)
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
            className={`hover:border-blue-500 grid h-full w-full select-none ${`grid-cols-100`} ${`grid-rows-100`} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {elements}
        </div>
    )
}
