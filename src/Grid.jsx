import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import { gridCheckedAtom, gridMovingAtom } from "./atoms"
export default function Grid(props) {
    const gridRef = useRef(null)
    const gridSizeX = 300
    const gridSizeY = 300
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [style, setStyle] = useState({})
    const [mouseDown, setMouseDown] = useState({ down: false, x1: 0, y1: 0, seconds: 0, milliseconds: 0 })
    const [elements, setElements] = useState([])
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    useEffect(() => {
        console.log("elements", elements)
    }, [elements])
    const getBoundingBox = (ref) => {
        //console.log(ref)
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            // rect contains properties: top, right, bottom, left, width, height
            return rect
        }
        return false
    }
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
                handleGridMove()
            } else if (gridMoving.type === "creating") {
                handleGridCreation()
            }
        }
    }, [gridMoving])

    const calculateGridPos = (itemCords, gridBoundingBox, gridSizeX, gridSizeY) => {
        let x1 = Math.floor(((itemCords.x1 - gridBoundingBox.left) / gridBoundingBox.width) * gridSizeX)
        let x2 = Math.floor(((itemCords.x2 - gridBoundingBox.left) / gridBoundingBox.width) * gridSizeX)
        let y1 = Math.floor(((itemCords.y1 - gridBoundingBox.top) / gridBoundingBox.height) * gridSizeY)
        let y2 = Math.floor(((itemCords.y2 - gridBoundingBox.top) / gridBoundingBox.height) * gridSizeY)
        return { x1, x2, y1, y2 }
    }

    const handleMouseDown = (e) => {
        e.stopPropagation()
        let type = "creating"
        console.log("gridChecked", gridChecked, props.id)
        if (gridChecked !== props.id) {
            console.log("cia")
            setGridSelect(false)
            setGridChecked("")
        }
        if (gridSelect && props.level !== 0) {
            type = "moving"
        }
        if (type == "creating") {
            const uuid = uuidv4()
            console.log("cia")
            let boundingBox = getBoundingBox(gridRef)
            let gridCords = calculateGridPos(
                { x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY },
                boundingBox,
                gridSizeX,
                gridSizeY
            )
            const newStyle = {
            gridColumnStart: e + 1,
            gridColumnEnd: gridCords.x2 + 2,
            gridRowStart: gridCords.y1 + 1,
            gridRowEnd: gridCords.y2 + 2,
            maxWidth: "100%", // Ensures content does not expand cell
            maxHeight: "100%", // Ensures content does not expand cell
            overflow: "hidden", // Prevents content from overflowing
        }
            setElements((i) => [
                ...i,
                <Grid
                    key={uuid}
                    className="bg-red-500"
                    parentRef={gridRef}
                    id={uuid}
                    childStyle={newStyle}
                    parentGridSizeY={gridSizeY}
                    parentGridSizeX={gridSizeX}
                    level={props.level + 1}
                ></Grid>,
            ])
        }
        let gridBoundingBox = getBoundingBox(gridRef)
        console.log(size.height, size.width)
        setGridMoving({
            type: type,
            id: props.id,
            moving: true,
            setBox: true,
            x1: e.clientX,
            y1: e.clientY,
            x2: e.clientX,
            y2: e.clientY,
            moved: false,
            gridBoundingBox: {
                top: gridBoundingBox.top,
                bottom: gridBoundingBox.top + size.height,
                left: gridBoundingBox.left,
                right: gridBoundingBox.left + size.width,
            },
        })
        return
        
    }
    const calculateMovement = (top, right, bottom, left, width, height, parentRef, gridSizeX, gridSizeY) => {
        //console.log("level", props.level)
        let parentBoundingBox = getBoundingBox(parentRef)
        console.log("right", right)
        console.log("parentBoundingBox", parentBoundingBox)
        console.log("paskuitinis", { x1: left, y1: top, x2: right, y2: bottom })
        let gridCords = calculateGridPos(
            { x1: left, y1: top, x2: right, y2: bottom },
            parentBoundingBox,
            gridSizeX,
            gridSizeY
        )
        console.log("gridCords", gridCords)
        console.log("gridMoving", gridMoving)
        if (gridMoving.type === "moving") {
            const desiredSizeX = Math.floor((width / parentBoundingBox.width) * gridSizeX) + 1
            const desiredSizeY = Math.floor((height / parentBoundingBox.height) * gridSizeY) + 1
            gridCords.x2 = gridCords.x1 + desiredSizeX
            gridCords.y2 = gridCords.y1 + desiredSizeY
        }
        //console.log("gridCords", desiredSizeX)
        //console.log("gridCords", desiredSizeY)

        const newStyle = {
            gridColumnStart: gridCords.x1 + 1,
            gridColumnEnd: gridCords.x2 + 2,
            gridRowStart: gridCords.y1 + 1,
            gridRowEnd: gridCords.y2 + 2,
            maxWidth: "100%", // Ensures content does not expand cell
            maxHeight: "100%", // Ensures content does not expand cell
            overflow: "hidden", // Prevents content from overflowing
        }
        //console.log("style", newStyle)
        if (gridMoving.type === "moving") {
            setStyle(newStyle)
        }
        if (gridMoving.type === "creating") {
                

                setElements((prevElements) => {
                    const newElements = prevElements.slice(0, -1);
                    const lastElement = prevElements[prevElements.length - 1];

                    newElements.push(<Grid
                        {...lastElement.props}
                        childStyle={newStyle}
                        key={lastElement.key || "some-unique-key"} // Adjust key as necessary
                    />)
                    return newElements
                })
        }
        console.log("style", newStyle)
        if (gridMoving.moved === true) {
            setGridMoving({ moving: false })
            
        }
        setGridMoving((i) => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        //console.log(gridCords)
        //console.log(gridMoving)
        //console.log(props.id)
        return
    }
    const handleGridMove = () => {
        let gridBoundingBox = gridMoving.gridBoundingBox

        let top = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.top
        let bottom = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.bottom
        let left = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.left
        let right = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.right
        calculateMovement(
            top,
            right,
            bottom,
            left,
            size.width,
            size.height,
            props.parentRef,
            props.parentGridSizeX,
            props.parentBoundingBox
        )
    }
    const handleGridCreation = () => {
        let top = gridMoving.y1
        let bottom = gridMoving.y2
        let left = gridMoving.x1
        let right = gridMoving.x2
        calculateMovement(top, right, bottom, left, 0, 0, gridRef, gridSizeX, gridSizeY)
    }
    const handleMouseUp = (e) => {
        e.stopPropagation()
        console.log("cia123")
        console.log("grid before mouse up", gridMoving)
        setGridMoving((i) => ({ ...i, x2: e.clientX, y2: e.clientY, moved: true }))
        return
    }

    useEffect(() => {}, [gridRef])

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
