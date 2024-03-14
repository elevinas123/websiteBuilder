import { useAtom } from "jotai"
import { programTypeAtom } from "./atoms"




export default function TestShit() {

    const [proramType, setProgramType] = useAtom(programTypeAtom)


    return (
        <div>
            <button onClick={() => setProgramType("editor")}>Go back to the editor</button>
            <div>Some shit to test</div>

        </div>
    )
}