export default function calculateNewStyle(left, top, width, height, gridPixelSize, backgroundColor) {
    const newStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${width}, ${gridPixelSize}px)`,
        gridTemplateRows: `repeat(${height}, ${gridPixelSize}px)`,
        gridColumnStart: Math.floor(left),
        gridColumnEnd: Math.floor(left) + Math.floor(width),
        gridRowStart: Math.floor(top),
        gridRowEnd: Math.floor(top) + Math.floor(height),
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
        backgroundColor: backgroundColor,
    }
    return newStyle
}
