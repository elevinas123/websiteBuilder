import MarkdownScreen from "./MarkdownScreen"
import WebsiteScreen from "./WebsiteScreen"

function App() {
    return (
        <div className="flex h-screen  flex-row bg-zinc-600 text-white">
            <MarkdownScreen />
            <WebsiteScreen />
        </div>
    )
}

export default App
