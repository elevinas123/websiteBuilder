import { produce } from "immer"

export default function handleGridoutOfBounds(gridMoving, parentId, setAllElements) {
    console.log(gridMoving, parentId, setAllElements)

    setAllElements((currentElements) =>
        produce(currentElements, (draft) => {
            // Filter out the moving element from its current parent's children
            const parentIndex = draft[parentId].children.findIndex((i) => i === gridMoving.id)
            if (parentIndex !== -1) {
                draft[parentId].children.splice(parentIndex, 1)
            }

            // Add the moving element to its new parent's children
            const newParentId = draft[parentId].parent
            if (!draft[newParentId].children.includes(gridMoving.id)) {
                draft[newParentId].children.push(gridMoving.id)
            }

            // Update the moving element's parent property
            draft[gridMoving.id].parent = newParentId
        })
    )
}
