// atoms.js

import { atom, PrimitiveAtom } from "jotai"
import { AllElements } from "./Types"
import { Dispatch, SetStateAction } from "react"


export interface GridMoving {
    id?: string
    type?: string
    moving?: boolean
    setBox?: boolean
    moved?: boolean
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    offset?: boolean
    offsetLeft?: number
    offsetTop?: number
}
const initialGridMoving: GridMoving = {
    id: "",
    moving: false,
    moved: false,
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



export const gridCheckedAtom = atom("")
export const gridMovingAtom: PrimitiveAtom<GridMoving> = atom(initialGridMoving)
export const allPositionsAtom = atom({})
export const cursorTypeAtom = atom("moving")
export const elementUpdatedAtom = atom("")
export const allElementsAtom: PrimitiveAtom<AllElements> = atom({})
export const mainGridRefAtom = atom(null)
export const startElementBoundingBoxAtom = atom({})
export const gridPixelSizeAtom = atom(2)
export const mainGridOffsetAtom = atom({ top: 0, left: 0, width: 10000, height: 10000 })
export const mainGridIdAtom = atom("")
export const HistoryClassAtom = atom(null)
export const intersectionLinesAtom = atom([])
export const visualsUpdatedAtom = atom({count: 0, id: ""})