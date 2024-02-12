// atoms.js

import { atom } from "jotai"

export const gridCheckedAtom = atom("")
export const gridMovingAtom = atom({ id: "", moving: false, moved: false, x1: 0, x2: 0, y1: 0, y2: 0, type: "" })
export const elementPositionsAtom = atom({})
export const cursorTypeAtom = atom("moving")
export const elementUpdatedAtom = atom("")
export const allElementsAtom = atom({})
export const allRefsAtom = atom({})
