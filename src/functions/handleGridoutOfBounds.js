import { produce } from "immer"
import calculateMovement from "./calculateMovement"

export default function handleGridoutOfBounds(gridMoving, parentId, allRefs, allElements, setAllElements) {
    console.log(gridMoving, parentId, setAllElements)
    const grandFatherId = allElements[parentId].parent
    const elementBoundingBox = allRefs[gridMoving.id].getBoundingClientRect()
    let elementInfo = {
        top: elementBoundingBox.top,
        bottom: elementBoundingBox.bottom,
        right: elementBoundingBox.right,
        left: elementBoundingBox.left,
    }
    const newStyle = calculateMovement(
        gridMoving,
        elementInfo.top,
        elementInfo.right,
        elementInfo.bottom,
        elementInfo.left,
        grandFatherId,
        allRefs, // Assuming this is correctly managed elsewhere to provide necessary references
        allElements,
        setAllElements // Be cautious with passing set functions into other functions; ensure this is necessary and handled properly
    )
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

            // Calculate new style for the moving element

            // Update the moving element's parent property and style
            draft[gridMoving.id].parent = newParentId
            draft[gridMoving.id].style = {...draft[gridMoving.id].style, ...newStyle}
        })
    )
}
