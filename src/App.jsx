import { useEffect, useState } from "react"
import MarkdownScreen from "./MarkdownScreen"
import WebsiteScreen from "./WebsiteScreen"
import { parse } from "parse5"

function App() {
    return (
        <div className="flex h-screen w-full flex-row justify-between bg-zinc-600 text-white">
            <MarkdownScreen />
            <WebsiteScreen />
        </div>
    )
}

export default App
