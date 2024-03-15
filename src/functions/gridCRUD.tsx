import Grid from "../Grid"
import { GridElement, Margin, Padding } from "../Types"
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
        borderColor: "transparent",
        borderWidth: 0,
    },
    borderTop: {
        borderColor: "transparent",
        borderWidth: 0,
    },
    borderRight: {
        borderColor: "transparent",
        borderWidth: 0,
    },
    borderBottom: {
        borderColor: "transparent",
        borderWidth: 0,
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
    margin: Margin,
    gridPixelSize: number,
    children: string[] = [],
    text: string = "",
    backgroundColor: string = "red",
    border: Border = initialBorder
): GridElement => {
    const newStyle = calculateNewStyle(left + margin.left, top + margin.top, width, height, gridPixelSize, backgroundColor)
    return {
        item: <Grid key={id} id={id} childStyle={newStyle}></Grid>,
        info: {
            left,
            top,
            itemWidth: width,
            itemHeight: height,
            contentWidth: width - padding.left - padding.right - border.borderLeft.borderWidth - border.borderRight.borderWidth,
            contentHeight: height - padding.top - padding.bottom - border.borderTop.borderWidth - border.borderBottom.borderWidth,
            padding,
            backgroundColor,
            border,
            margin
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

export const createMainGrid = (
    id: string,
    width: number,
    height: number,
    gridPixelSize: number,
    children: string[] = [],
    backgroundColor: string = "red",
    mainRef: any
): GridElement => {
    const left = 1
    const top = 1
    const newStyle = calculateNewStyle(left, top, width, height, gridPixelSize, backgroundColor)
    return {
        item: <Grid key={id} id={id} mainRef={mainRef} childStyle={newStyle}></Grid>,
        info: {
            left,
            top,
            itemWidth: width,
            itemHeight: height,
            contentHeight: height,
            contentWidth: width,
            padding: { top: 0, left: 0, right: 0, bottom: 0 },
            backgroundColor,
            border: initialBorder,
            margin: { top: 0, left: 0, right: 0, bottom: 0 },
        },
        id: id,
        style: {
            ...newStyle,
        },
        text: "",
        parent: null,
        children: children,
    }
}
