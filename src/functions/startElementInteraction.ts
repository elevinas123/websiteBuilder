import { SetGridMoving } from "../atoms"



export default function startElementInteraction(id: string, x: number, y: number, type: string, setGridMoving: SetGridMoving) {
    setGridMoving({
        type: type,
        id: id,
        moving: true,
        setBox: true,
        moved: false,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        offset: false,
        offsetLeft: 0,
        offsetTop: 0,
    })
    return
}
