import {  useState } from "react"

export default function MarkdownScreen() {
    const [text, setText] = useState("")
    return (
        <div className="h-full w-full border-r">
            <textarea
                className="resize border bg-zinc-600"
                value={text}
                onChange={(e) => setText(e.target.value)}
            ></textarea>
        </div>
    )
}
