export default function calculateNewStyle(left, top, width, height) {
    
    const newStyle = {
        gridColumnStart: Math.floor(left),
        gridColumnEnd: Math.floor(left) + Math.floor(width),
        gridRowStart: Math.floor(top),
        gridRowEnd: Math.floor(top) + Math.floor(height),
        maxWidth: "100%", // Ensures content does not expand cell
        maxHeight: "100%", // Ensures content does not expand cell
    }
    return newStyle
}
