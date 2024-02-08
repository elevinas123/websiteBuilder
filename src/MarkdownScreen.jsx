import { useState } from "react"



export default function MarkdownScreen(props) {


    const [text, setText] = useState("")

    return (
        <div className="w-full h-full border-r">
            <textarea className="resize bg-zinc-600 border" value={text} onChange={(e) => setText(e.target.value)}></textarea>
            <button onClick={() => props.setCode(text)}>setCode</button>
        </div>
    )
}