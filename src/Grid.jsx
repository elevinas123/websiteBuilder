import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { allElementsAtom, cursorTypeAtom, gridCheckedAtom, gridMovingAtom } from "./atoms"
import startMovingElement from "./functions/startMovingElement"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleGridCreation from "./functions/handleGridCreation"
export default function Grid(props) {
    const [style, setStyle] = useState({})
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)

    useEffect(() => {
        console.log("from girds", allElements)
    }, [allElements])

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
                handleGridMove(gridMoving, allElements[props.id].parent, allElements, setAllElements, setStyle, setGridMoving)
            } else if (gridMoving.type === "creating") {
                handleGridCreation(gridMoving, allElements[props.id].parent, allElements, setAllElements, setGridMoving)
            }
        }
    }, [gridMoving])

    const handleMouseDown = (event) => {
        event.stopPropagation()
        if (cursorType === "moving") {
            setGridChecked(props.id)
            startMovingElement(
                event,
                allElements[props.id].parent,
                props.id,
                allElements[props.id].width,
                allElements[props.id].height,
                "moving",
                allElements,
                setGridMoving
            )
            return
        }
        if (cursorType == "creating") {
            startCreatingElement(event, props.id, allElements, setGridMoving, setAllElements)
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
            style={allElements[props.id].style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`grid h-full w-full select-none hover:border-blue-500 ${`grid-cols-300`} ${`grid-rows-300`} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {allElements[props.id].children.length > 0 && allElements[props.id].children.map((i) => allElements[i].item)}
        </div>
    )
}
