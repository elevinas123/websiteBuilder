import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight } from "react-icons/fa"
import { HistoryClassAtom, allElementsAtom, gridCheckedAtom, gridPixelSizeAtom, mainGridIdAtom, visualsUpdatedAtom } from "./atoms"
import justifyCenter from "./functions/justifies/justifyCenter"
import justifyLeft from "./functions/justifies/justifyLeft"
import justifyRight from "./functions/justifies/justifyRight"
import justifyBetween from "./functions/justifies/justifyBetween"
import { debounce } from "lodash"
import { Justify } from "./Types"

export default function ItemInfoScreen() {
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridChecked, setGridChecked] = useAtom(gridCheckedAtom)
    const [gridPixelSize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [mainGridId, setMainGridId] = useAtom(mainGridIdAtom)
    const [itemId, setItemId] = useState("")
    const [HistoryClass, setHistoryClass] = useAtom(HistoryClassAtom)
    const [updateHistory, setUpdateHistory] = useState(true)
    const [visualsUpdated, setVisualsUpdated] = useAtom(visualsUpdatedAtom)
    useEffect(() => {
        if (itemId === "") return
        HistoryClass.performAction(allElements)
    }, [updateHistory])
    useEffect(() => {
        if (!HistoryClass) return
    }, [allElements])

    const debouncedUpdateHistory = useCallback(
        debounce((id) => {
            console.log("cia")
            setVisualsUpdated((i) => ({ count: i.count + 1, id: id }))
            setUpdateHistory((i) => !i)
        }, 500),
        []
    )

    const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gridChecked == "") return

        setAllElements((prevElements) => ({
            ...prevElements,
            [itemId]: {
                ...prevElements[itemId],
                style: {
                    ...prevElements[itemId].style,
                    backgroundColor: e.target.value,
                },
                info: {
                    ...prevElements[itemId].info,
                    backgroundColor: e.target.value,
                },
            },
        }))
        debouncedUpdateHistory(itemId)
    }
    useEffect(() => {
        if (gridChecked === "") {
            setItemId(mainGridId)
        } else {
            setItemId(gridChecked)
        }
    }, [gridChecked, mainGridId])
    const changeBorderColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllElements((prevElements) => ({
            ...prevElements,
            [itemId]: {
                ...prevElements[itemId],
                style: {
                    ...prevElements[itemId].style,
                    borderRightColor: e.target.value,
                    borderLeftColor: e.target.value,
                    borderTopColor: e.target.value,
                    borderBottomColor: e.target.value,
                },
                info: {
                    ...prevElements[itemId].info,
                    border: {
                        borderRight: {
                            ...prevElements[itemId].info.border.borderRight,
                            borderColor: e.target.value,
                        },
                        borderLeft: {
                            ...prevElements[itemId].info.border.borderLeft,
                            borderColor: e.target.value,
                        },
                        borderTop: {
                            ...prevElements[itemId].info.border.borderTop,
                            borderColor: e.target.value,
                        },
                        borderBottom: {
                            ...prevElements[itemId].info.border.borderBottom,
                            borderColor: e.target.value,
                        },
                    },
                },
            },
        }))
        debouncedUpdateHistory(itemId)
    }

    const justifyElement = (type: Justify) => {
        if (type === "left") {
            justifyLeft(itemId, allElements, setAllElements, gridPixelSize)
        } else if (type === "center") {
            justifyCenter(itemId, allElements, setAllElements, gridPixelSize)
        } else if (type === "spaceBetween") {
            justifyBetween(itemId, allElements, setAllElements, gridPixelSize)
        } else if (type === "right") {
            justifyRight(itemId, allElements, setAllElements, gridPixelSize)
        }
        setUpdateHistory(i  => !i)
    }
    if (itemId === "") {

        return
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
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="left" onClick={() => justifyElement("left")}>
                        <FaAlignLeft />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="center" onClick={() => justifyElement("center")}>
                        <FaAlignCenter />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="spaceBetween" onClick={() => justifyElement("spaceBetween")}>
                        <FaAlignJustify />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-200" id="right" onClick={() => justifyElement("right")}>
                        <FaAlignRight />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-row">
                <div>
                    <div className="mt-2 flex w-20 flex-row border border-white bg-red-500 p-1 hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">X</div>
                        <div className="ml-3 text-xs text-gray-600">{allElements[itemId] && allElements[itemId].info.top}</div>
                    </div>
                    <div className="mt-2 flex flex-row border border-white p-1 hover:border hover:border-gray-300 ">
                        <div className="ml-3 text-xs text-gray-400">Y</div>
                        <div className="ml-3 text-xs text-gray-600">{allElements[itemId] && allElements[itemId].info.left}</div>
                    </div>
                </div>
                <div className="ml-4">
                    <div className="mt-2 flex flex-row border border-white p-1  hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">X</div>
                        <div className="ml-3 text-xs text-gray-600">{allElements[itemId] && allElements[itemId].info.itemWidth}</div>
                    </div>
                    <div className="mt-2 flex flex-row border border-white p-1  hover:border hover:border-gray-300">
                        <div className="ml-3 text-xs text-gray-400">W</div>
                        <div className="ml-3 text-xs text-gray-600">{allElements[itemId] && allElements[itemId].info.itemHeight}</div>
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
                        <input type="color" className="h-4 w-4" onChange={changeBorderColor}></input>
                        <div className="ml-2 flex flex-col text-sm">#f12321</div>
                    </div>
                    <div></div>
                </div>
            </div>
            <div>
                <div>GridSize</div>
                <input
                    className="bg-zinc-200 text-black"
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => setGridPixelSize(parseFloat(e.target.value))}
                    type=""
                ></input>
            </div>
        </div>
    )
}
