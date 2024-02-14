import { useEffect, useRef, useState } from "react"
import Grid from "./Grid"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import { allElementsAtom, cursorTypeAtom, gridCheckedAtom, gridMovingAtom, gridPixelSizeAtom, mainGridOffsetAtom, startElementBoundingBoxAtom } from "./atoms"
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
    const mainGridRef = useRef(null)
    useEffect(() => {
        if (!mainGridRef.current) return
        if (mainGridId !== "") return
        const mainId = uuidv4()
        const mainGridBoundingBox = roundBoundingBox(getBoundingBox(mainGridRef))
        setStartingElementBoundingBox(mainGridBoundingBox)
        setAllElements((i) => ({
            ...i,
            [mainId]: {
                item: <Grid mainGrid={mainId} key={mainId} className="bg-red-500" id={mainId}></Grid>,
                id: mainId,
                width: 10000,
                height: 10000,
                top: 0,
                left: 0,
                style: {
                    gridTemplateColumns: `repeat(${10000}, ${gridPixelSize}px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${10000}, ${gridPixelSize}px)`,
                    backgroundColor: "teal",
                    maxWidth: "100%", // Ensures content does not expand cell
                    maxHeight: "100%", // Ensures content does not expand cell
                    display: "grid",
                },
                parent: null,
                children: [],
                text: "",
            },
        }))
        setMainGridId(mainId)
    }, [mainGridRef])

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
                <div className="mr-2 h-full w-full bg-red-500">
                    <div
                        style={{
                            maxWidth: "100%", // Ensures content does not expand cell
                            maxHeight: "100%", // Ensures content does not expand cell
                        }}
                        ref={mainGridRef}
                        onKeyDown={handleTextWritten}
                        className="mt-20 h-full w-full  overflow-auto bg-white text-black"
                        onMouseMove={handleMousemove}
                    >
                        {allElements[mainGridId.id] &&
                            allElements[mainGridId.id].children.map((i) => {
                                if (
                                    (allElements[i].left > mainGridOffset.left ||
                                        allElements[i].left + allElements[i].width < mainGridOffset.left + mainGridOffset.width,
                                    allElements[i].left > mainGridOffset.left ||
                                        allElements[i].top + allElements[i].height < mainGridOffset.top + mainGridOffset.height)
                                ) {
                                    console.log(allElements[i].item, i, mainGridOffset)
                                    return allElements[i].item
                                }
                                return ""
                            })}
                    </div>
                </div>
            </div>
            <ItemInfoScreen />
        </div>
    )
}
