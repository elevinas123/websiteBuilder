import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { allElementsAtom } from "./atoms"

interface LeftHandMenu {
    id: string
}

const LeftHandMenuItem: React.FC<LeftHandMenu> = (props) => {
    const [opened, setOpened] = useState(false)
    const [childrenElements, setChildrenElements] = useState<JSX.Element[]>([])
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    useEffect(() => {
        if (!(props.id in allElements)) return
        console.log("props.id", props.id)
        console.log("props.id", allElements)
        let childrenIds = allElements[props.id].children
        let elements = childrenIds.map((id) => <LeftHandMenuItem id={id} key={id} />)
        setChildrenElements(elements)
    }, [allElements])

    return (
        <div>
            <div
                onClick={() => setOpened((i) => !i)}
                style={{
                    backgroundColor: props.id in allElements ? allElements[props.id].info.backgroundColor : "white",
                }}
                className="-mt-1 w-32 border-collapse cursor-pointer border border-black bg-zinc-300 p-2 text-sm hover:bg-zinc-100"
            >
                rectangle 1
            </div>
            {opened && childrenElements}
        </div>
    )
}

export default LeftHandMenuItem
