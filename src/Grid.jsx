import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { allElementsAtom, allRefsAtom, cursorTypeAtom, gridCheckedAtom, gridMovingAtom } from "./atoms"
import startMovingElement from "./functions/startMovingElement"
import startCreatingElement from "./functions/startCreatingElement"
import handleGridMove from "./functions/handleGridMove"
import handleGridCreation from "./functions/handleGridCreation"
import getBoundingBox from "./functions/getBoundingBox"
export default function Grid(props) {
    const gridRef = useRef(null)
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [allRefs, setAllRefs] = useAtom(allRefsAtom)

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

    const handleMouseUp = (e) => {
        e.stopPropagation()
        setGridMoving((i) => ({ ...i, x2: e.clientX, y2: e.clientY, moved: true }))
        return
    }

    return (
        <div
            ref={gridRef}
            style={allElements[props.id].style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`grid h-full w-full select-none  ${`grid-cols-300`} ${`grid-rows-300`} ${gridSelect ? "border-dashed" : ""} border border-red-500 bg-slate-200 `}
        >
            {allElements[props.id].children.length > 0 && allElements[props.id].children.map((i) => allElements[i].item)}
        </div>
    )
}
