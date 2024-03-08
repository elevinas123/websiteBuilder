import React from "react"
import { Dispatch, SetStateAction } from 'react';
// Assuming the structure of the style object
export interface Style {
    display: string
    gridTemplateColumns: string
    gridTemplateRows: string
    gridColumnStart: number
    gridColumnEnd: number
    gridRowStart: number
    gridRowEnd: number
    maxWidth: string
    maxHeight: string
    backgroundColor: string
    paddingLeft?: number
    paddingRight?: number
    paddingTop?: number
    paddingBottom?: number
    // Add other style properties as needed
}
export interface Padding {
    left: number
    top: number
    right: number
    bottom: number
}
export type Justify = "left" | "center" | "spaceBetween" | "right"

// Define the structure for the "info" part of the grid element
export interface GridInfo {
    left: number
    top: number
    width: number
    height: number
    padding: Padding
    backgroundColor: string
    justify?: Justify
}

// Assuming Grid is a React component with these props
export interface GridProps {
    key: string
    className: string
    id: string
    childStyle: Style

}

// Define what a grid element looks like
export interface GridElement {
    item: React.ReactElement<GridProps>
    info: GridInfo
    id: string
    style: Style
    text: string
    parent: string |null
    children: string[] // Assuming children are of the same type
}

// Define the container for all grid elements, indexed by their ID
export interface AllElements {
    [id: string]: GridElement
}
export type SetAllElements = Dispatch<SetStateAction<AllElements>>