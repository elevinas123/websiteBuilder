import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { gridCheckedAtom, gridMovingAtom } from "./atoms"
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
    const [lastClick, setLastClick] = useState(0)
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
            return
        } else if (gridSelect === true) {
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
        if (gridMoving.id === props.id && gridMoving.moving && !gridMoving.setBox) {
            if (gridMoving.type === "moving") {
                handleGridMove(gridMoving, size.width, size.height, props.parentRef, props.parentSizeX, props.parentSizeY, setStyle, setElements, setGridMoving)
            } else if (gridMoving.type === "creating") {
                handleGridCreation(gridMoving, 0, 0, gridRef, gridSizeX, gridSizeY, setStyle, setElements, setGridMoving)
            }
        }
    }, [gridMoving])

    const selectElement = () => {
        if (gridChecked !== props.id) {
            console.log("cia")
            setGridSelect(false)
            setGridChecked("")
        }
    }

    const handleMouseDown = (event) => {
        event.stopPropagation()

        const now = Date.now()
        const doubleClickDelay = 300 // Milliseconds considered for double-click
        const isDoubleClick = now - lastClick <= doubleClickDelay

        setLastClick(now)

        if (isDoubleClick) {
            // Handle double-click logic here
            console.log("Double click detected")
            // Your double-click logic, for example:
            selectElement()
        } else {
            // Single-click logic, delayed to verify it's not a double click
            setTimeout(() => {
                if (Date.now() - lastClick >= doubleClickDelay) {
                    // Handle single-click logic here if no double-click was detected
                    console.log("Single click detected")
                    // Your single-click logic here
                }
            }, doubleClickDelay)
        }
        let type = "creating"
        if (gridSelect && props.level !== 0) {
            startMovingElement(event, size, props.id, "moving", setGridMoving)
        }
        if (type == "creating") {
            startCreatingElement(event, gridRef, gridSizeX, gridSizeY, props.level, props.id, setGridMoving, setElements)
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
            className={`grid h-full w-full select-none ${`grid-cols-300`} ${`grid-rows-300`} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {elements}
        </div>
    )
}
