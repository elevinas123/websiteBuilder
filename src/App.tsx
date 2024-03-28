import { useAtom } from "jotai"
import MarkdownScreen from "./MarkdownScreen"
import WebsiteScreen from "./WebsiteScreen"
import { programTypeAtom } from "./atoms"
import TestShit from "./TestShit"
import LeftHandMenu from "./LeftHandMenu"

function App() {

    const [programType, setProgramType] = useAtom(programTypeAtom)

    if (programType === "editor") {
        return (
            <div className="flex h-screen  flex-row bg-zinc-600 text-white">
                <MarkdownScreen />
                <WebsiteScreen />
            </div>
        )
    } else {
        return (
            <div>
                <TestShit />
            </div>
        )
    }
    
}

export default App
