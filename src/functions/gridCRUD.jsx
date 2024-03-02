import Grid from "../Grid"
import calculateNewStyle from "./calculateNewStyle"

export const createNewGrid = (id, parentId, left, top, width, height, padding, gridPixelSize, children = [], text = "", bgColor = "red") => {
    const newStyle = calculateNewStyle(left, top, width, height, gridPixelSize)
    return {
        item: <Grid key={id} className="bg-red-500" id={id} childStyle={newStyle}></Grid>,
        id: id,
        width: width,
        height: height,
        left: left,
        top: top,
        css: {
            width: `w-${width}`,
            height: `h-${height}`,
        },
        style: { ...newStyle, backgroundColor: bgColor },
        text: text,
        padding,
        parent: parentId,
        children: children,
    }
}
