export default function startElementInteraction(id, x, y, type, setGridMoving) {
    console.log(id, x, y, type)
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
    })
    return
}
