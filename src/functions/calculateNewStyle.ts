
export default function calculateNewStyle(left: number, top: number, width: number, height: number, gridPixelSize: number, backgroundColor: string): React.CSSProperties {
    const newStyle: React.CSSProperties = {
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: `repeat(${width}, ${gridPixelSize}px)`,
        gridTemplateRows: `repeat(${height}, ${gridPixelSize}px)`,
        gridColumnStart: left > 0 ? Math.floor(left) : 1,
        gridColumnEnd: Math.floor(left) + Math.floor(width),
        gridRowStart: top > 0 ? Math.floor(top) : 1,
        gridRowEnd: Math.floor(top) + Math.floor(height),
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
        backgroundColor: backgroundColor,
    }
    return newStyle
}
