export default function handleGridoutOfBounds(gridMoving, parentId, setAllElements) {
    setAllElements((elements) => ({
        ...elements,
        [parentId]: { ...elements[parentId], children: [...elements.children.filter((i) => i.id !== gridMoving.id)] },
        [elements[parentId].parent]: {
            ...elements[elements[parentId].parent],
            children: [...elements[elements[parentId].parent].children, gridMoving.id],
            parent: elements[parentId].parent,
        },
    }))
}
