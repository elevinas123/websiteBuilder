import { useEffect, useRef, useState } from "react"

export default function Grid() {
    const gridRef = useRef(null)
    const [mouseDown, setMouseDown] = useState({ down: false, x: 0, y: 0 })
    const [elements, setElements] = useState([])
    const getBoundingBox = (ref) => {
        console.log(ref)
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            console.log(rect)
            // rect contains properties: top, right, bottom, left, width, height
            return rect
        }
        return false
    }

    const handleMouseDown = (e) => {
        console.log(e)
        setMouseDown({ down: true, x: e.clientX, y: e.clientY })
    }
    const handleMouseUp = (e) => {
        console.log(e)
        let boundingBox = getBoundingBox(gridRef)
        let rowsStart = Math.floor(boundingBox.right - boundingBox.left)
    }
    useEffect(() => {
        console.log(getBoundingBox(gridRef))
        console.log(gridRef)
    }, [gridRef])

    return (
        <div
            ref={gridRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="grid h-96 w-96 grid-cols-10 grid-rows-10 bg-slate-200"
        >
            {elements}
        </div>
    )
}
