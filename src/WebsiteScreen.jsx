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
    mainGridIdAtom,
    mainGridOffsetAtom,
    mainGridRefAtom,
    startElementBoundingBoxAtom,
} from "./atoms"
import getBoundingBox from "./functions/getBoundingBox"
import ItemInfoScreen from "./ItemInfoScreen"
import calculateNewStyle from "./functions/calculateNewStyle"
export default function WebsiteScreen() {
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [startElementBoundingBox, setStartingElementBoundingBox] = useAtom(startElementBoundingBoxAtom)
    const [gridPixelSize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [mainGridOffset, setMainGridOffset] = useAtom(mainGridOffsetAtom)
    const [mainGridRef, setMainGridRef] = useAtom(mainGridRefAtom)
    const [mainGridId, setMainGridId] = useAtom(mainGridIdAtom)
    function roundBoundingBox(boundingBox) {
        if (!boundingBox) return
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
        setMainGridOffset({ top: mainRef.current.scrollTop / gridPixelSize, left: mainRef.current.scrollLeft / gridPixelSize })
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
                        gridTemplateColumns: `repeat(${element.width}, ${gridPixelSize}px)`,
                        gridTemplateRows: `repeat(${element.height}, ${gridPixelSize}px)`,
                        paddingLeft: element.padding.left * gridPixelSize,
                        paddingRight: element.padding.right * gridPixelSize,
                        paddingTop: element.padding.top * gridPixelSize,
                        paddingBottom: element.padding.bottom * gridPixelSize,
                    },
                }
            })

            return updatedElements // Return the updated elements object to update the state
        })
        console.log(allElements)
    }, [gridPixelSize])

    const mainRef = useRef(null)
    useEffect(() => {
        if (!mainRef.current) return
        const mainId = uuidv4()
        const mainGridBoundingBox = roundBoundingBox(getBoundingBox(mainRef))

        setStartingElementBoundingBox(mainGridBoundingBox)

        setAllElements({
            [mainId]: {
                item: <Grid mainRef={mainRef} key={mainId} className="bg-red-500" id={mainId}></Grid>,
                id: mainId,
                width: 10000,
                height: 10000,
                top: 0,
                left: 0,
                style: {
                    gridTemplateColumns: `repeat(${10000}, ${gridPixelSize}px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${10000}, ${gridPixelSize}px)`,
                    backgroundColor: "gray",
                    width: 10000,
                    height: 10000,
                },
                css: {
                    width: "w-10000",
                    backgroundColor: "bg-gray",
                    height: "h-10000",
                },
                padding: {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                },
                parent: null,
                children: ["main-webGrid"],
                text: "",
            },
            ["main-webGrid"]: {
                item: <Grid key={mainId} className="bg-red-500" id={"main-webGrid"}></Grid>,
                id: "main-webGrid",
                css: {
                    width: "w-1920",
                    height: "h-1080",
                    backgroundColor: "bg-red",
                },
                width: 1920,
                height: 1080,
                top: 50,
                left: 50,
                style: {
                    ...calculateNewStyle(50, 50, 1920, 1080, gridPixelSize),
                    backgroundColor: "red",
                    paddingLeft: 50 * gridPixelSize,
                    paddingRight: 50 * gridPixelSize,
                    paddingTop: 50 * gridPixelSize,
                    paddingBottom: 50 * gridPixelSize,
                },
                padding: {
                    top: 50,
                    left: 50,
                    right: 50,
                    bottom: 50,
                },
                parent: mainId,
                children: [],
                text: "",
            },
        })

        setMainGridId(mainId)
    }, [mainRef])
    const handleWindowResize = () => {
        if (!mainRef.current) return
        const mainGridBoundingBox = roundBoundingBox(getBoundingBox(mainRef))
        setStartingElementBoundingBox(mainGridBoundingBox)
    }
    useEffect(() => {
        handleWindowResize()
    }, [mainGridId])
    useEffect(() => {
        // Handler to call on window resize

        window.addEventListener("resize", handleWindowResize)

        // Call handler right away so state gets updated with initial window size
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleWindowResize)
    }, []) // Empty array ensures this effect runs only on mount and unmo

    useEffect(() => {
        mainRef.current.scrollTop = 0
        mainRef.current.scrollLeft = 0
        setMainGridOffset({ top: 0, left: 0, width: 10000, height: 10000 })
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
                let x2 = e.clientX - startElementBoundingBox.left
                let y2 = e.clientY - startElementBoundingBox.top
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
        mainRef.current.scrollTop = mainGridOffset.top * gridPixelSize
    }
    useEffect(() => {
        const handleWheel = (event) => {
            if (event.ctrlKey) {
                // Check if the Ctrl key is pressed
                event.preventDefault() // Prevent the default zoom or scroll action
                let boundingBox = roundBoundingBox(getBoundingBox(mainRef))
                const cursorX = event.clientX - boundingBox.left
                const cursorY = event.clientY - boundingBox.top

                // Assuming the zooming action increments/decrements the gridPixelSize by 20%
                const zoomInFactor = 1.2
                const zoomOutFactor = 0.8333 // Approximately the inverse of 1.2
                const isZoomingIn = event.deltaY < 0

                setGridPixelSize((prevSize) => {
                    const scaleFactor = isZoomingIn ? zoomInFactor : zoomOutFactor
                    const newSize = prevSize * scaleFactor
                    
                    // Calculate the new scroll positions
                    let newSizeLeft = cursorX / newSize - boundingBox.right / newSize
                    let newSizeTop = cursorY / newSize - boundingBox.bottom / newSize
                    
                    console.log("boundingBox", boundingBox)
                    console.log("newSizeLeft", newSizeLeft)
                    console.log("cursorX", cursorX)
                    console.log("cursorY", cursorY)
                    console.log(newSizeTop)
                    console.log(mainRef.current.scrollLeft)
                    console.log(mainRef.current.scrollTop)
                    // Update scroll position
                    requestAnimationFrame(() => {
                        mainRef.current.scrollLeft += newSizeLeft
                        mainRef.current.scrollTop += newSizeTop
                    })

                    return Math.min(Math.max(newSize, 0.2), 5) // Clamp newSize between min and max values
                })
            }
        }

        window.addEventListener("wheel", handleWheel, { passive: false })

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("wheel", handleWheel)
        }
    }, [])

    return (
        <div className="flex h-full w-2/3 flex-row">
            <div className=" mt-2 flex h-full w-full flex-col overflow-hidden text-black">
                <div className=" flex h-32 flex-col bg-zinc-200">
                    <div>Navbar</div>
                    <div className="mt-3">
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "moving" ? "bg-blue-500" : "hover:bg-zinc-400"} `}
                            onClick={() => setCursorType("moving")}
                        >
                            moving
                        </button>
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "creating" ? "bg-blue-500" : "hover:bg-zinc-400"} `}
                            onClick={() => setCursorType("creating")}
                        >
                            creating
                        </button>
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "padding" ? "bg-blue-500" : "hover:bg-zinc-400"} `}
                            onClick={() => setCursorType("padding")}
                        >
                            padding
                        </button>
                    </div>
                </div>
                <div
                    ref={mainRef}
                    onScroll={(e) => handleDragStart(e)}
                    tabIndex={0}
                    onKeyDown={handleTextWritten}
                    className=" element bg-red mt-10  h-full w-full overflow-scroll text-black"
                    onMouseMove={handleMousemove}
                >
                    {mainGridId && allElements[mainGridId].item}
                </div>
            </div>
            <ItemInfoScreen />
        </div>
    )
}
