import { useEffect, useState } from "react"



export default function WebsiteScreen(props) {

    const [parsedCode, setParsedCode] = useState(null)

    useEffect(() => {

        if (props.jsx) {
            
            console.log("html", props.jsx)
            setParsedCode(props.jsx)
        }

    }, [props.jsx])

    return (
        <div className="w-full h-full ml-2">
            <div className="w-96 h-96 bg-white ml-20 mt-20 text-black">
                {parsedCode}
            </div>
        </div>
    )
}