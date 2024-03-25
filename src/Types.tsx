import React from "react"
import { Dispatch, SetStateAction } from 'react';
import { Border } from "./functions/gridCRUD";
// Assuming the structure of the style object

export interface Padding {
    left: number
    top: number
    right: number
    bottom: number
}
export type Justify = "left" | "center" | "spaceBetween" | "right"

export interface Margin {
    left: number
    top: number
    right: number
    bottom: number
}

// Define the structure for the "info" part of the grid element
export interface GridInfo {
    left: number
    top: number
    itemHeight: number
    itemWidth: number
    contentHeight: number
    contentWidth: number
    padding: Padding
    backgroundColor: string
    border: Border
    margin: Margin
    justifyDirection: "row" |"coll"
    justify?: Justify
}

// Assuming Grid is a React component with these props
export interface GridProps {
    key: string
    className: string
    id: string
    childStyle: React.CSSProperties

}

// Define what a grid element looks like
export interface GridElement {
    item: React.ReactElement<GridProps>
    info: GridInfo
    id: string
    style: React.CSSProperties
    text: string
    parent: string |null
    children: string[] // Assuming children are of the same type
}

// Define the container for all grid elements, indexed by their ID
export interface AllElements {
    [id: string]: GridElement
}
export type SetAllElements = Dispatch<SetStateAction<AllElements>>