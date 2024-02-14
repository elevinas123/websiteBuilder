import { useAtom } from "jotai"
import { useState } from "react"
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight } from "react-icons/fa"
import { allElementsAtom, gridCheckedAtom } from "./atoms"

export default function ItemInfoScreen(props) {
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)

    const changeColor = (e) => {
        if (gridChecked == "") return

        setAllElements((prevElements) => ({
            ...prevElements,
            [gridChecked]: {
                ...prevElements[gridChecked],
                style: {
                    ...prevElements[gridChecked].style,
                    backgroundColor: e.target.value,
                },
            },
        }))
    }
    const changeBorderColor = (e) => {
        if (gridChecked == "") return
        console.log(e.target.value)
        setAllElements((prevElements) => ({
            ...prevElements,
            [gridChecked]: {
                ...prevElements[gridChecked],
                style: {
                    ...prevElements[gridChecked].style,
                    borderColor: e.target.value,
                },
            },
        }))
    }
    const justifyMap = {
        left: "flex-start",
        center: "center",
        spaceBetween: "space-between",
        right: "flex-end",
    }
    const changeJustify = (e) => {
        if (gridChecked == "") return
        setAllElements((prevElements) => ({
            ...prevElements,
            [gridChecked]: {
                ...prevElements[gridChecked],
                style: {
                    ...prevElements[gridChecked].style,
                    justifyContents: justifyMap[e.target.id] || "flex-start",
                },
            },
        }))
    }

    return (
        <div className="flex h-full w-64 flex-col bg-white p-2 pl-1 text-gray-400">
            <div className="mt-4 flex flex-col">
                <div className="ml-4 text-sm text-black">Display</div>
                <div className="mt-3 flex flex-row text-sm">
                    <button className="ml-4 border border-white p-1 text-black hover:border hover:border-gray-300">Flex</button>
                    <button className="ml-4 border border-white p-1 hover:border hover:border-gray-300">Grid</button>
                </div>
            </div>
            <div className="mt-4 flex flex-col">
                <div className="flex flex-row text-sm text-black">
                    <div className="ml-4">Design</div>
                </div>
                <div className="mt-4 flex flex-row">
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="left" onClick={changeJustify}>
                        <FaAlignLeft />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="center" onClick={changeJustify}>
                        <FaAlignCenter />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="spaceBetween" onClick={changeJustify}>
                        <FaAlignJustify />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="right" onClick={changeJustify}>
                        <FaAlignRight />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-row">
                <div>
                    <div className="mt-2 flex flex-row border border-white p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">X</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                    <div className="mt-2 flex flex-row border border-white p-1 hover:border hover:border-gray-300 ">
                        <div className="ml-3 text-xs text-gray-400">W</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                    <div className="mt-2 flex flex-row border border-white p-1 p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">X</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                </div>
                <div className="ml-4">
                    <div className="mt-2 flex flex-row border border-white p-1 p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">X</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                    <div className="mt-2 flex flex-row border border-white p-1 p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">W</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                    <div className="mt-2 flex flex-row border border-white p-1 p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">X</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-col">
                <div className="ml-4  text-sm text-black">Layer</div>
                <div className="flex flex-row">
                    <div className="mt-2 flex flex-row border border-white p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">Z</div>
                        <div className="ml-3 text-xs text-gray-600">39</div>
                    </div>
                    <div className="ml-7 mt-2 flex flex-row border border-white p-1 hover:border hover:border-gray-300">
                        <div className=" text-xs text-gray-600">100%</div>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-col">
                <div className="ml-4  text-sm text-black">Fill</div>
                <div className="ml-4 mt-4 flex flex-row ">
                    <div className="flex h-6 flex-row items-center border border-white  p-1 hover:border hover:border-gray-300">
                        <input type="color" className="h-4 w-4" onChange={changeColor}></input>
                        <div className="ml-2 flex flex-col text-sm">#f12321</div>
                    </div>
                    <div></div>
                </div>
            </div>
            <div className="mt-4 flex flex-col">
                <div className="ml-4  text-sm text-black">Border</div>
                <div className="ml-4 mt-4 flex flex-row ">
                    <div className="flex h-6 flex-row items-center border border-white  p-1 hover:border hover:border-gray-300">
                        <input
                            type="color"
                            className="h-4 w-4"
                            onChange={changeBorderColor}
                            value={gridChecked !== "" && allElements[gridChecked].style && allElements[gridChecked].style.borderColor}
                        ></input>
                        <div className="ml-2 flex flex-col text-sm">#f12321</div>
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}
