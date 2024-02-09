import { useEffect, useRef, useState } from "react"

export default function Grid(props) {
    const gridRef = useRef(null)
    const gridSizeX = 100
    const gridSizeY = 100
    const [mouseDown, setMouseDown] = useState({ down: false, x1: 0, y1: 0, seconds: 0, milliseconds: 0 })
    const [elements, setElements] = useState([])
    const [gridSelect, setGridSelect] = useState(false)
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
   
    const calculateGridPos = (itemCords, gridBoundingBox, gridSizeX, gridSizeY) => {
        let x1 = Math.floor((itemCords.x1 - gridBoundingBox.left)/gridBoundingBox.width*gridSizeX)
        let x2 = Math.floor((itemCords.x2 - gridBoundingBox.left)/gridBoundingBox.width*gridSizeX)
        let y1 = Math.floor((itemCords.y1 - gridBoundingBox.top)/gridBoundingBox.height*gridSizeY)
        let y2 = Math.floor((itemCords.y2 - gridBoundingBox.top)/gridBoundingBox.height*gridSizeY)
        return {x1, x2, y1, y2}
    }

    const handleMouseDown = (e) => {
        e.stopPropagation()
       
        console.log(e)
        const currentDate = new Date();
        const milliseconds = currentDate.getMilliseconds();
        const seconds = currentDate.getSeconds();
        console.log(milliseconds);

        setMouseDown({ down: true, x1: e.clientX, y1: e.clientY, milliseconds, seconds })
    }
    const handleMouseUp = (e) => {
        e.stopPropagation()
        const currentDate = new Date();
        const elapsedMilliseconds = (currentDate.getSeconds() - mouseDown.seconds) * 1000 + (currentDate.getMilliseconds() - mouseDown.milliseconds);

        if (elapsedMilliseconds < 100) {
            setGridSelect(true);
            return
        }
        if (mouseDown.down == false) return
        console.log("e", e)
        let boundingBox = getBoundingBox(gridRef)
        let gridCords = calculateGridPos({ ...mouseDown, x2: e.clientX, y2: e.clientY }, boundingBox, gridSizeX, gridSizeY)
        console.log(gridCords)
        const style = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: '100%', // Ensures content does not expand cell
        maxHeight: '100%', // Ensures content does not expand cell
        overflow: 'hidden', // Prevents content from overflowing
    };
        // Assuming you want to add these as classes for Tailwind CSS
        setElements(i => [...i, <Grid key={gridCords.x1} className="bg-red-500" style={style} level={props.level+1}></Grid>]);
    }
    useEffect(() => {
        console.log(getBoundingBox(gridRef))
        console.log(gridRef)
    }, [gridRef])

    return (
        <div
            style={props.style}
            ref={gridRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`select-none grid h-full w-full ${`grid-cols-100`} ${`grid-rows-100`} ${gridSelect?"border-dashed":""} bg-slate-200 border border-red-500 `}
        >
            {elements}
        </div>
    )
}
