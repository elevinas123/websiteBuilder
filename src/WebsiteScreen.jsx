import { useEffect, useState } from "react"
import Grid from "./Grid"

export default function WebsiteScreen(props) {
    return (
        <div className="ml-20 mt-2 flex h-full w-full flex-col text-black">
            <div className=" h-32 bg-zinc-200">Nabvbar</div>
            <div className="mt-20 h-2/3 w-3/4  bg-white text-black">
                <Grid level={0} />
            </div>
        </div>
    )
}
