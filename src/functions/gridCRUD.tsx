import Grid from "../Grid"
import { Padding } from "../Types"
import calculateNewStyle from "./calculateNewStyle"

export const createNewGrid = (
    id: string,
    parentId: string | null,
    left: number,
    top: number,
    width: number,
    height: number,
    padding: Padding,
    gridPixelSize: number,
    children: string[] = [],
    text: string = "",
    backgroundColor: string = "red"
) => {
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
        style: {
            ...newStyle,
            paddingLeft: padding.left * gridPixelSize,
            paddingRight: padding.right * gridPixelSize,
            paddingTop: padding.top * gridPixelSize,
            paddingBottom: padding.bottom * gridPixelSize,
        },
        text: text,
        parent: parentId,
        children: children,
    }
}
