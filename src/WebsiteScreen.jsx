import { useState } from "react"
import Grid from "./Grid"
import { v4 as uuidv4 } from "uuid"
import { useAtom } from "jotai"
import { gridMovingAtom } from "./atoms"
export default function WebsiteScreen() {
    const [mainGridId, setMainGridId] = useState(uuidv4())
    const [gridMoving, setGridMoving] = useAtom(gridMovingAtom)

    const handleMousemove = (e) => {
        if (gridMoving.moving && gridMoving.setBox) {
            setGridMoving((i) => {
                let x1 = i.x2
                let y1 = i.y2
                let x2 = e.clientX
                let y2 = e.clientY
                return { ...i, x1, x2, y1, y2, setBox: false }
            })
            console.log(gridMoving)
        }
    }

    return (
        <div className="ml-20 mt-2 flex h-full w-full flex-col text-black">
            <div className=" h-32 bg-zinc-200">Nabvbar</div>
            <div className="mt-20 h-2/3 w-3/4  bg-white text-black" onMouseMove={handleMousemove}>
                <Grid level={0} id={mainGridId} />
            </div>
        </div>
    )
}
