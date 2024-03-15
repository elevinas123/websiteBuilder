import { useAtom } from "jotai"
import { programTypeAtom } from "./atoms"




export default function TestShit() {

    const [proramType, setProgramType] = useAtom(programTypeAtom)


    return (
        <div>
            <button onClick={() => setProgramType("editor")}>Go back to the editor</button>
            <div className="ml-20 mt-20 h-64 w-64 rounded-full bg-red-500">
                <div className="h-5 w-5 bg-blue-500"></div>
            </div>
        </div>
    )
}