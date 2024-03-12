import Grid from "../Grid"
import { Padding } from "../Types"
import calculateNewStyle from "./calculateNewStyle"

export interface Border {
    borderLeft: {
        borderColor: string
        borderWidth: number
    }
    borderTop: {
        borderColor: string
        borderWidth: number
    }
    borderRight: {
        borderColor: string
        borderWidth: number
    }
    borderBottom: {
        borderColor: string
        borderWidth: number
    }
}
const initialBorder = {
    borderLeft: {
        borderColor: "white",
        borderWidth: 1,
    },
    borderTop: {
        borderColor: "white",
        borderWidth: 1,
    },
    borderRight: {
        borderColor: "white",
        borderWidth: 1,
    },
    borderBottom: {
        borderColor: "white",
        borderWidth: 1,
    },
}

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
    backgroundColor: string = "red",
    border: Border = initialBorder
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
            border,
        },
        id: id,
        style: {
            ...newStyle,
            paddingLeft: padding.left * gridPixelSize,
            paddingRight: padding.right * gridPixelSize,
            paddingTop: padding.top * gridPixelSize,
            paddingBottom: padding.bottom * gridPixelSize,
            borderRightWidth: border.borderRight.borderWidth * gridPixelSize,
            borderLeftWidth: border.borderLeft.borderWidth * gridPixelSize,
            borderTopWidth: border.borderTop.borderWidth * gridPixelSize,
            borderBottomWidth: border.borderBottom.borderWidth * gridPixelSize,
            borderRightColor: border.borderRight.borderColor,
            borderLeftColor: border.borderLeft.borderColor,
            borderTopColor: border.borderTop.borderColor,
            borderBottomColor: border.borderBottom.borderColor,
        },
        text: text,
        parent: parentId,
        children: children,
    }
}
