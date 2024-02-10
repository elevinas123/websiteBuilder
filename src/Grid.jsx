import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { useAtom } from 'jotai';
import { gridCheckedAtom, gridMovingAtom } from "./atoms";
export default function Grid(props) {
    const gridRef = useRef(null)
    const gridSizeX = 100
    const gridSizeY = 100
    const [size, setSize] = useState({width: 0, height: 0})
    const [style, setStyle] = useState({})
    const [mouseDown, setMouseDown] = useState({ down: false, x1: 0, y1: 0, seconds: 0, milliseconds: 0 })
    const [elements, setElements] = useState([])
    const [gridSelect, setGridSelect] = useState(false)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom);
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom);
    const getBoundingBox = (ref) => {
        console.log(ref)
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            // rect contains properties: top, right, bottom, left, width, height
            return rect
        }
        return false
    }
    useEffect(() => {
        const gridElement = gridRef.current;
        if (!gridElement) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const {width, height} = entry.contentRect;
                setSize({width, height});
            }
        });

        resizeObserver.observe(gridElement);

        return () => resizeObserver.unobserve(gridElement);
    }, []); // Empty dependency array ensures this effect runs once on mount
     useEffect(() => {
         // Check if the props.id matches the ID of this item
        
        if (props.id === gridChecked && gridChecked !== "" && !gridSelect) {
            return
        } else if (gridSelect === true) {
            setGridSelect(false)
        }
     }, [gridChecked, props.id]);
    
    useEffect(() => {
        if (!props.childStyle) {
            return
        }
        setStyle(props.childStyle)
    }, [props.childStyle])

    useEffect(() => {
        if (gridMoving.id === props.id && gridMoving.moving && !gridMoving.setBox) {
            handleMove()
        }
    }, [gridMoving])
    
    const checkRemainder = (num, type) => {
        if (type === 1) {
            if (num - Math.floor(num) > 0.5) {
                return Math.floor(num)
            } else {
                return Math.ceil(num)
        }
        }
        if (num - Math.floor(num) > 0.5) {
            return Math.ceil(num)
        } else {
            return Math.floor(num)
        }
    }
    
    
   
    const calculateGridPos = (itemCords, gridBoundingBox, gridSizeX, gridSizeY) => {
    let x1 = Math.floor((itemCords.x1 - gridBoundingBox.left) / gridBoundingBox.width * gridSizeX);
    let x2 = Math.floor((itemCords.x2 - gridBoundingBox.left) / gridBoundingBox.width * gridSizeX);
    let y1 = Math.floor((itemCords.y1 - gridBoundingBox.top) / gridBoundingBox.height * gridSizeY);
    let y2 = Math.floor((itemCords.y2 - gridBoundingBox.top) / gridBoundingBox.height * gridSizeY);


    return { x1, x2, y1, y2 };
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
        if (gridSelect && props.level !==0) {
            type = "moving"
            let gridBoundingBox = getBoundingBox(gridRef)
            console.log(size.height, size.width)
            setGridMoving({id: props.id, moving: true, x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY , moved: false, gridBoundingBox: {top: gridBoundingBox.top, bottom: gridBoundingBox.top + size.height, left: gridBoundingBox.left, right: gridBoundingBox.left + size.width}})
        }
        const currentDate = new Date();
        const milliseconds = currentDate.getMilliseconds();
        const seconds = currentDate.getSeconds();
        
        setMouseDown({ down: true, type:type, x1: e.clientX, y1: e.clientY, milliseconds, seconds })
    }
    const handleMove = () => {
        let gridBoundingBox = gridMoving.gridBoundingBox
        let parentBoundingBox = getBoundingBox(props.parentRef)

        let top = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.top
        let bottom = gridMoving.y2 - gridMoving.y1 + gridBoundingBox.bottom
        let left = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.left
        let right = gridMoving.x2 - gridMoving.x1 + gridBoundingBox.right
        console.log("top", top )
        console.log("bottom", bottom)
        let gridCords = calculateGridPos({ x1: left, y1: top, x2: right, y2: bottom }, parentBoundingBox, props.parentGridSizeX, props.parentGridSizeY)
        const newStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: '100%', // Ensures content does not expand cell
        maxHeight: '100%', // Ensures content does not expand cell
        overflow: 'hidden', // Prevents content from overflowing
        };
        console.log(style)
        setStyle(newStyle)
        if (gridMoving.moved === true) {
            setGridMoving({moving: false})
        } setGridMoving(i => ({ ...i, gridBoundingBox: { top, bottom, left, right }, setBox: true }))
        console.log(gridCords)
        console.log(gridMoving)
        console.log(props.id)

    }
    const handleMouseUp = (e) => {
        e.stopPropagation()
        if (mouseDown.down == false) return
        if (gridMoving.moving) {
            console.log("grid before mouse up", gridMoving)
            setGridMoving(i => ({...i, x2: e.clientX, y2: e.clientY, moved: true}))
            return
        }
        const currentDate = new Date();
        const elapsedMilliseconds = (currentDate.getSeconds() - mouseDown.seconds) * 1000 + (currentDate.getMilliseconds() - mouseDown.milliseconds);

        if (elapsedMilliseconds < 200) {
            setGridSelect(true)
            setGridChecked(props.id)
            return
        }
        let boundingBox = getBoundingBox(gridRef)
        let gridCords = calculateGridPos({ ...mouseDown, x2: e.clientX, y2: e.clientY }, boundingBox, gridSizeX, gridSizeY)
        const childStyle = {
        gridColumnStart: gridCords.x1 + 1,
        gridColumnEnd: gridCords.x2 + 2,
        gridRowStart: gridCords.y1 + 1,
        gridRowEnd: gridCords.y2 + 2,
        maxWidth: '100%', // Ensures content does not expand cell
        maxHeight: '100%', // Ensures content does not expand cell
        overflow: 'hidden', // Prevents content from overflowing
        };
        const uuid = uuidv4();
        // Assuming you want to add these as classes for Tailwind CSS
        setElements(i => [...i, <Grid key={uuid} className="bg-red-500" parentRef={gridRef} id={uuid} childStyle={childStyle} parentGridSizeY={gridSizeY} parentGridSizeX={gridSizeX} level={props.level+1}></Grid>]);
    }
    
    useEffect(() => {
    }, [gridRef])

    return (
        <div
            style={style}
            ref={gridRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`select-none grid h-full w-full ${`grid-cols-100`} ${`grid-rows-100`} ${gridSelect?"border-dashed":""} bg-slate-200 border border-red-500 `}
        >
            {elements}
        </div>
    )
}
