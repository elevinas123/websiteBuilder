import { useEffect, useState } from "react"
import Grid from "./Grid"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import { cursorTypeAtom, gridMovingAtom } from "./atoms"
export default function WebsiteScreen() {
    const [mainGridId, setMainGridId] = useState(uuidv4())
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)
    const [cursorType, setCursorType] = useAtom(cursorTypeAtom)

    const handleMousemove = (e) => {
        if (gridMoving.moving) {
            if (gridMoving.type === "moving") {
                setGridMoving((i) => {
                    if (!i.setBox) {
                        return { ...i }
                    }
                    let x1 = i.x2
                    let y1 = i.y2
                    let x2 = e.clientX
                    let y2 = e.clientY
                    return { ...i, x1, x2, y1, y2, setBox: false }
                })
                return
            }
            if (gridMoving.type === "creating") {
                setGridMoving((i) => {
                    if (!i.setBox) {
                        return { ...i }
                    }
                    console.log("from gri", i)

                    let x2 = e.clientX
                    let y2 = e.clientY
                    let arr = { ...i, x2, y2, setBox: false }
                    console.log("from gris", arr)

                    return arr
                })
            }
        }
    }

    return (
        <div className="ml-20 mt-2 flex h-full w-full flex-col text-black">
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
                </div>
            </div>
            <div className="mt-20 h-2/3 w-3/4  bg-white text-black" onMouseMove={handleMousemove}>
                <Grid level={0} id={mainGridId} />
            </div>
        </div>
    )
}
