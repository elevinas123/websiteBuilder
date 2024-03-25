// atoms.js

import { atom, PrimitiveAtom } from "jotai"
import { AllElements } from "./Types"
import { Dispatch, SetStateAction } from "react"

// Defining other types and interfaces as per your setup
export interface GridMoving {
    id: string
    type: string
    moving: boolean
    setBox: boolean
    moved: boolean
    x1: number
    y1: number
    x2: number
    y2: number
    offset: boolean
    offsetLeft: number
    offsetTop: number
}

interface VisualsUpdated {
    count: number
    id: string | undefined
}

// Initial values
const initialGridMoving: GridMoving = {
    id: "",
    moving: false,
    moved: false,
    setBox: false,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    type: "",
    offset: false,
    offsetLeft: 0,
    offsetTop: 0,
}
export type SetGridMoving = Dispatch<SetStateAction<GridMoving>>
export type CursorType = "moving" | "grid-moving" | "resizing" | "resizingH" | "resizingT" | "creating" | "padding" | "border" | "margin"
export type SetCursorType = Dispatch<SetStateAction<CursorType>>
export type SetGridChecked = Dispatch<SetStateAction<string>>
// Atoms definition
export const gridCheckedAtom: PrimitiveAtom<string> = atom("")
export const gridMovingAtom: PrimitiveAtom<GridMoving> = atom(initialGridMoving)
export const allPositionsAtom: PrimitiveAtom<AllElements> = atom({}) // Assuming you have a more specific type than {}
export const cursorTypeAtom: PrimitiveAtom<CursorType> = atom<CursorType>("moving")
export const elementUpdatedAtom: PrimitiveAtom<string> = atom("")
export const allElementsAtom: PrimitiveAtom<AllElements> = atom<AllElements>({})
export const mainGridBoundingRectAtom = atom<DOMRect | null>(null)
export const startElementBoundingBoxAtom: PrimitiveAtom<any> = atom({}) // Specify if possible
export const gridPixelSizeAtom: PrimitiveAtom<number> = atom(1)
export const mainGridOffsetAtom: PrimitiveAtom<{ top: number; left: number; width: number; height: number }> = atom({
    top: 0,
    left: 0,
    width: 10000,
    height: 10000,
})
export const mainGridIdAtom: PrimitiveAtom<string> = atom("")
export const HistoryClassAtom: PrimitiveAtom<any> = atom(null) // Specify the type if you have a class/type for History
export const visualsUpdatedAtom: PrimitiveAtom<VisualsUpdated> = atom<VisualsUpdated>({ count: 0, id: "" })

export const programTypeAtom = atom("editor")
