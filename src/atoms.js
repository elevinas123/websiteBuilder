// atoms.js

import { atom } from 'jotai';

export const gridCheckedAtom = atom("");
export const gridMovingAtom = atom({id: "", moving: false, moved: false, x1: 0, x2: 0, y1: 0, y2: 0});
