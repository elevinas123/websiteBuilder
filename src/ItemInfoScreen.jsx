import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight } from "react-icons/fa"

export default function ItemInfoScreen(props) {
    return (
        <div className="flex h-full w-64 flex-col bg-white p-2 pl-1 text-gray-400">
            <div className="flex flex-col">
                <div className="flex flex-row text-sm text-black">
                    <div className="ml-4">Design</div>
                </div>
                <div className="mt-4 flex flex-row">
                    <div className="ml-3 rounded p-1 hover:bg-zinc-400">
                        <FaAlignLeft />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-400">
                        <FaAlignCenter />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-400">
                        <FaAlignJustify />
                    </div>
                    <div className="ml-3 rounded p-1 hover:bg-zinc-400">
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
                        <div className="h-4 w-4 bg-red-500"></div>
                        <div className="ml-2 flex flex-col text-sm">#f12321</div>
                    </div>
                    <div></div>
                </div>
            </div>
            <div className="mt-4 flex flex-col">
                <div className="ml-4  text-sm text-black">Border</div>
                <div className="ml-4 mt-4 flex flex-row ">
                    <div className="flex h-6 flex-row items-center border border-white  p-1 hover:border hover:border-gray-300">
                        <div className="h-4 w-4 bg-green-500"></div>
                        <div className="ml-2 flex flex-col text-sm">#f12321</div>
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}
