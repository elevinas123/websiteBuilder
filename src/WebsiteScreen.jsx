import { useEffect, useRef, useState, useLayoutEffect } from "react"
import Grid from "./Grid"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import {
    HistoryClassAtom,
    allElementsAtom,
    cursorTypeAtom,
    gridCheckedAtom,
    gridMovingAtom,
    gridPixelSizeAtom,
    mainGridIdAtom,
    mainGridOffsetAtom,
    startElementBoundingBoxAtom,
    visualsUpdatedAtom,
} from "./atoms"
import getBoundingBox from "./functions/getBoundingBox"
import ItemInfoScreen from "./ItemInfoScreen"
import calculateNewStyle from "./functions/calculateNewStyle"
import UndoTree from "./UndoTree"
import { createNewGrid } from "./functions/gridCRUD"
export default function WebsiteScreen() {
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [startElementBoundingBox, setStartingElementBoundingBox] = useAtom(startElementBoundingBoxAtom)
    const [gridPixelSize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [mainGridOffset, setMainGridOffset] = useAtom(mainGridOffsetAtom)
    const [mainGridId, setMainGridId] = useAtom(mainGridIdAtom)
    const [HistoryClass, setHistoryClass] = useAtom(HistoryClassAtom)
    const latestValuesRef = useRef({ scrollLeft: 0, scrollTop: 0 })
    const MIN_GRID_PIXEL_SIZE = 0.25 // Example minimum zoom level
    const MAX_GRID_PIXEL_SIZE = 10 // Example maximum zoom level

    const [prevSize, setPrevSize] = useState(2)
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
    useLayoutEffect(() => {
        console.log(gridPixelSize, prevSize)
        if (gridPixelSize === undefined) return // Ensure gridPixelSize is initialized

        // Use the latest event details for calculations
        const { cursorX, cursorY } = latestValuesRef.current
        const logicalXPreZoom = (cursorX + mainRef.current.scrollLeft) / prevSize
        const logicalYPreZoom = (cursorY + mainRef.current.scrollTop) / prevSize

        // Calculate the new scroll positions based on the updated gridPixelSize
        const newScrollLeft = logicalXPreZoom * gridPixelSize - cursorX
        const newScrollTop = logicalYPreZoom * gridPixelSize - cursorY

        // Apply the new scroll positions
        mainRef.current.scrollLeft = newScrollLeft
        mainRef.current.scrollTop = newScrollTop
    }, [gridPixelSize]) // This effect runs every time gridPixelSize changes
    useEffect(() => {
        setMainGridOffset({ top: mainRef.current.scrollTop / gridPixelSize, left: mainRef.current.scrollLeft / gridPixelSize })
        setAllElements((currentElements) => {
            const updatedElements = {}

            // Iterate over each element in the current state
            Object.entries(currentElements).forEach(([id, element]) => {
                console.log("element", element)
                // Update the style attribute for each element
                updatedElements[id] = {
                    ...element, // Spread to copy other properties of the element unchanged
                    style: {
                        ...element.style, // Spread to copy existing styles
                        // Update specific style properties
                        gridTemplateColumns: `repeat(${element.info.width}, ${gridPixelSize}px)`,
                        gridTemplateRows: `repeat(${element.info.height}, ${gridPixelSize}px)`,
                        width: element.info.width * gridPixelSize + element.info.padding.left * gridPixelSize + element.info.padding.right * gridPixelSize,
                        height: element.info.height * gridPixelSize + element.info.padding.top * gridPixelSize + element.info.padding.bottom * gridPixelSize,
                        paddingLeft: element.info.padding.left * gridPixelSize,
                        paddingRight: element.info.padding.right * gridPixelSize,
                        paddingTop: element.info.padding.top * gridPixelSize,
                        paddingBottom: element.info.padding.bottom * gridPixelSize,
                    },
                }
            })

            return updatedElements // Return the updated elements object to update the state
        })
        setPrevSize(gridPixelSize)
        console.log(allElements)
    }, [gridPixelSize])
    useEffect(() => {
        if (allElements["main-webGrid"]) HistoryClass.performAction(allElements)
        console.log(HistoryClass)
    }, [prevSize])

    const mainRef = useRef(null)
    useEffect(() => {
        if (!mainRef.current) return
        const mainId = uuidv4()
        const mainGridBoundingBox = roundBoundingBox(getBoundingBox(mainRef))

        setStartingElementBoundingBox(mainGridBoundingBox)

        setAllElements({
            [mainId]: createNewGrid(mainId, null, 0, 0, 10000, 10000, { top: 0, left: 0, right: 0, bottom: 0 }, gridPixelSize, ["main-webGrid"]),
            ["main-webGrid"]: createNewGrid("main-webGrid", mainId, 50, 50, 1920, 1080, { top: 50, left: 50, right: 50, bottom: 50 }, gridPixelSize, [], "", "black"),
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
        if (mainGridId) {
            setHistoryClass(new UndoTree(allElements))
        }
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
                event.preventDefault()

                const scaleFactor = event.deltaY < 0 ? 1.5 : 0.6666 // Adjusting scale factor for zoom in/out
                setGridPixelSize((prevSize) => {
                    // Apply the scale factor and clamp the value between min and max zoom levels
                    let newSize = prevSize * scaleFactor
                    newSize = Math.max(MIN_GRID_PIXEL_SIZE, Math.min(newSize, MAX_GRID_PIXEL_SIZE))

                    // Optionally, round the newSize to a desired precision
                    // For example, rounding to two decimal places
                    newSize = Math.round(newSize * 100) / 100

                    return newSize
                })

                // Capture the latest event details for use in layout effect
                const boundingBox = mainRef.current.getBoundingClientRect()
                latestValuesRef.current = {
                    cursorX: event.clientX - boundingBox.left,
                    cursorY: event.clientY - boundingBox.top,
                }
            }
        }

        window.addEventListener("wheel", handleWheel, { passive: false })

        return () => window.removeEventListener("wheel", handleWheel)
    }, []) // Dependencies are empty to setup and teardown the event listener

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
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "padding" ? "bg-blue-500" : "hover:bg-zinc-400"} `}
                            onClick={() => {
                                HistoryClass.undo()
                                console.log(HistoryClass.currentNode.state)

                                setAllElements({ ...HistoryClass.currentNode.state })
                            }}
                        >
                            Undo
                        </button>
                        <button
                            className={`ml-2 select-none rounded-md bg-zinc-300 p-2  ${cursorType === "padding" ? "bg-blue-500" : "hover:bg-zinc-400"} `}
                            onClick={() => {
                                HistoryClass.redo()
                                console.log(HistoryClass.currentNode)
                                setAllElements({ ...HistoryClass.currentNode.state })
                            }}
                        >
                            Undo
                        </button>
                    </div>
                </div>
                <div
                    ref={mainRef}
                    onScroll={(e) => handleDragStart(e)}
                    tabIndex={0}
                    onKeyDown={handleTextWritten}
                    className="element bg-red mt-10  h-full w-full overflow-scroll text-black"
                    onMouseMove={handleMousemove}
                >
                    {mainGridId && allElements[mainGridId].item}
                </div>
            </div>
            <ItemInfoScreen />
        </div>
    )
}
