import Grid from "../Grid"
import calculateNewStyle from "./calculateNewStyle"

export const createNewGrid = (id, parentId, left, top, width, height, padding, gridPixelSize, children = [], text = "", backgroundColor = "red") => {
    const newStyle = calculateNewStyle(left, top, width, height, gridPixelSize, backgroundColor)
    return {
        item: <Grid key={id} className="bg-red-500" id={id} childStyle={newStyle}></Grid>,
        info: {
            left,
            top,
            width,
            height,
            padding,
            backgroundColor,
        },
        id: id,
        style: { ...newStyle },
        text: text,
        parent: parentId,
        children: children,
    }
}
