export default function calculateMovement(mousePos, x: number, y: number) {
    const newY = y + mousePos.y2 - mousePos.y1
    const newX = x + mousePos.x2 - mousePos.x1
    return [newX, newY]
}
