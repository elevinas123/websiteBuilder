// atoms.js

import { atom } from "jotai"

export const gridCheckedAtom = atom("")
export const gridMovingAtom = atom({ id: "", moving: false, moved: false, x1: 0, x2: 0, y1: 0, y2: 0, type: "" })
export const elementPositionsAtom = atom({})
export const cursorTypeAtom = atom("moving")
export const elementUpdatedAtom = atom("")
export const allElementsAtom = atom({})
export const mainGridRefAtom = atom(null)
export const startElementBoundingBoxAtom = atom({})
export const gridPixelSizeAtom = atom(2)
export const mainGridOffsetAtom = atom({ top: 0, left: 0, width: 10000, height: 10000 })
export const mainGridIdAtom = atom("")