import { useEffect, useRef, useState } from "react"
import Grid from "./Grid"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import { allElementsAtom, cursorTypeAtom, gridCheckedAtom, gridMovingAtom, startElementBoundingBoxAtom } from "./atoms"
import getBoundingBox from "./functions/getBoundingBox"
import ItemInfoScreen from "./ItemInfoScreen"
export default function WebsiteScreen() {
    const [mainGridId, setMainGridId] = useState("")
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [startElementBoundingBox, setStartingElementBoundingBox] = useAtom(startElementBoundingBoxAtom)

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
        console.log("cia")
        const mainId = uuidv4()
        const mainGridBoundingBox = roundBoundingBox(getBoundingBox(mainGridRef))
        console.log(mainGridBoundingBox)
        setStartingElementBoundingBox(mainGridBoundingBox)
        setAllElements({
            [mainId]: {
                item: <Grid mainGrid={mainId} key={mainId} className="bg-red-500" id={mainId}></Grid>,
                id: mainId,
                width: mainGridBoundingBox.width,
                height: mainGridBoundingBox.height,
                top: 0,
                left: 0,
                style: {
                    gridTemplateColumns: `repeat(${Math.floor(mainGridBoundingBox.width)}, 1px)`, // 10 columns, each 4px wide
                    gridTemplateRows: `repeat(${Math.floor(mainGridBoundingBox.height)}, 1px)`,
                },
                parent: null,
                children: [],
                text: "",
            },
        })
        setMainGridId(mainId)
    }, [mainGridRef])

    const handleMousemove = (e) => {
        if (gridMoving.moving) {
            if (gridMoving.type === "moving" || gridMoving.type === "creating" || gridMoving.type === "resizing") {
                setGridMoving((i) => {
                    if (i.moved) return { ...i }
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

            if (gridMoving.type === "resizingH") {
                setGridMoving((i) => {
                    if (i.moved) return { ...i }
                    if (!i.setBox) {
                        return { ...i }
                    }
                    let y1 = i.y2
                    let y2 = e.clientY - startElementBoundingBox.top
                    let arr = { ...i, y1, y2, setBox: false }

                    return arr
                })
            }
            if (gridMoving.type === "resizingW") {
                setGridMoving((i) => {
                    if (i.moved) return { ...i }
                    if (!i.setBox) {
                        return { ...i }
                    }

                    let x1 = i.x2
                    let x2 = e.clientX - startElementBoundingBox.left
                    let arr = { ...i, x1, x2, setBox: false }

                    return arr
                })
            }
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
                <div
                    ref={mainGridRef}
                    tabIndex={0}
                    onKeyDown={handleTextWritten}
                    className="mt-20 h-2/3 w-3/4  bg-white text-black"
                    onMouseMove={handleMousemove}
                >
                    {mainGridId && allElements[mainGridId].item}
                </div>
            </div>
            <ItemInfoScreen />
        </div>
    )
}
