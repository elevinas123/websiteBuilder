import { useEffect, useState } from "react"
import Grid from "./Grid"



export default function WebsiteScreen(props) {

    const [parsedCode, setParsedCode] = useState(null)

    useEffect(() => {

        if (props.jsx) {
            
            console.log("html", props.jsx)
            setParsedCode(props.jsx)
        }

    }, [props.jsx])

    return (
        <div className="w-full h-full ml-20 text-black flex flex-col mt-2">
            <div className=" bg-zinc-200 h-32">Nabvbar</div>
            <div className="w-full h-full bg-white  mt-20 text-black">
                <Grid />
            </div>
        </div>
    )
}