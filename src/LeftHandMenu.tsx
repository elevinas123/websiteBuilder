import LeftHandMenuItem from "./LeftHandMenuItem"

export default function LeftHandMenu() {
    return (
        <table className="w-64 border-collapse bg-zinc-200 p-2 text-black">
            <div className="m-2">Items</div>
            <div className="m-2">
                <LeftHandMenuItem id={"main-webGrid"} />
            </div>
        </table>
    )
}
