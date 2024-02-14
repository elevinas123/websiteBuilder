import { useEffect, useRef, useState } from "react"
import Grid from "./Grid"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import {
    allElementsAtom,
    cursorTypeAtom,
    gridCheckedAtom,
    gridMovingAtom,
    gridPixelSizeAtom,
    mainGridOffsetAtom,
    mainGridRefAtom,
    startElementBoundingBoxAtom,
} from "./atoms"
import getBoundingBox from "./functions/getBoundingBox"
import ItemInfoScreen from "./ItemInfoScreen"
export default function WebsiteScreen() {
    const [mainGridId, setMainGridId] = useState("")
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [startElementBoundingBox, setStartingElementBoundingBox] = useAtom(startElementBoundingBoxAtom)
    const [gridPixelSize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [mainGridOffset, setMainGridOffset] = useAtom(mainGridOffsetAtom)
    const [mainGridRef, setMainGridRef] = useAtom(mainGridRefAtom)
    const [scrollPosition, setScrollPosition] = useState(0)
    function roundBoundingBox(boundingBox) {
        return {
            left: Math.floor(boundingBox.left),
            top: Math.floor(boundingBox.top),
            right: Math.floor(boundingBox.right),
            bottom: Math.floor(boundingBox.bottom),
            width: Math.floor(boundingBox.width),
            height: Math.floor(boundingBox.height),
        }
    }
    useEffect(() => {

        setAllElements((currentElements) => {
            const updatedElements = {}

            // Iterate over each element in the current state
            Object.entries(currentElements).forEach(([id, element]) => {
                // Update the style attribute for each element
                updatedElements[id] = {
                    ...element, // Spread to copy other properties of the element unchanged
                    style: {
                        ...element.style, // Spread to copy existing styles
                        // Update specific style properties
                        gridTemplateColumns: `repeat(10000, ${gridPixelSize}px)`,
                        gridTemplateRows: `repeat(10000, ${gridPixelSize}px)`,
                    },
                }
            })

            return updatedElements // Return the updated elements object to update the state
        })
        
    }, [gridPixelSize[mainGridId]])
    useEffect(() => {
        console.log("alll", allElements)
        console.log(" asdasd", mainGridOffset)
        console.log(" gridPixelSize", gridPixelSize)
        mainRef.current.scrollTop = mainGridOffset.top * gridPixelSize
        mainRef.current.scrollLeft = mainGridOffset.left * gridPixelSize
        console.log(" scrollTop", mainRef.current.scrollTop)
        console.log(" scrollLeft", mainRef.current.scrollLeft)
    }, [allElements])
    const mainRef = useRef(null)
    useEffect(() => {
        if (!mainRef.current) return
        const mainId = uuidv4()
        const mainGridBoundingBox = roundBoundingBox(getBoundingBox(mainRef))
        
        setStartingElementBoundingBox(mainGridBoundingBox)
        setAllElements({
            [mainId]: {
                item: <Grid mainGrid={mainId} mainRef={mainRef} key={mainId} className="bg-red-500" id={mainId}></Grid>,
                id: mainId,
                width: 10000,
                height: 10000,
                top: 0,
                left: 0,
                style: {
                    gridTemplateColumns: `repeat(${10000}, ${gridPixelSize}px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${10000}, ${gridPixelSize}px)`,
                    width: 10000,
                    height: 10000,
                },
                parent: null,
                children: [],
                text: "",
            },
        })
        
        setMainGridId(mainId)
    }, [mainRef])
    useEffect(() => {
        mainRef.current.scrollTop = 5000
        mainRef.current.scrollLeft = 5000
        console.log(mainRef.current.scrollLeft)
        setMainGridOffset({ top: 5000, left: 5000, width: 10000, height: 10000 })
    }, [mainGridId])
    const handleMousemove = (e) => {
        if (gridMoving.moving) {
            setGridMoving((i) => {
                if (i.moved) return { ...i, setBox: false }
                if (!i.setBox) {
                    return { ...i }
                }
                let x1 = i.x2
                let y1 = i.y2
                let x2 = (e.clientX - startElementBoundingBox.left) / gridPixelSize
                let y2 = (e.clientY - startElementBoundingBox.top) / gridPixelSize
                return { ...i, x1, x2, y1, y2, setBox: false }
            })
            return
        }
    }
    const handleTextWritten = (event) => {
        console.log(event.key)
        if (event.key === "Backspace") {
            console.log("no backspace functionality")
        } else {
            setAllElements((prevElements) => ({
                ...prevElements,
                [gridChecked]: {
                    ...prevElements[gridChecked],
                    text: prevElements[gridChecked].text + event.key,
                },
            }))
        }
    }
    const handleDragStart = (e, index) => {
        e.preventDefault()
        mainRef.current.scrollTop = mainGridOffset.top
    }

    return (
        <div className="flex h-full w-full flex-row">
            <div className="ml-20 mt-2 flex h-full w-full flex-col text-black">
                <div className=" flex h-32 flex-col bg-zinc-200">
                    <div>Navbar</div>
                    <div className="mt-3">
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "moving" ? "bg-blue-400" : "hover:bg-zinc-400"} `}
                            onClick={() => setCursorType("moving")}
                        >
                            moving
                        </button>
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "creating" ? "bg-blue-400" : "hover:bg-zinc-400"} `}
                            onClick={() => setCursorType("creating")}
                        >
                            creating
                        </button>
                    </div>
                </div>
                <div
                    ref={mainRef}
                    onScroll={(e) => handleDragStart(e)}
                    tabIndex={0}
                    onKeyDown={handleTextWritten}
                    className=" element bg-red mt-10  h-96 w-96 overflow-scroll text-black"
                    onMouseMove={handleMousemove}
                >
                    {mainGridId && allElements[mainGridId].item}
                </div>
            </div>
            <ItemInfoScreen />
        </div>
    )
}
