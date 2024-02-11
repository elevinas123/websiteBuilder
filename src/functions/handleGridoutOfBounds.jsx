import Grid from "../Grid"
import calculateMovement from "./calculateMovement"

export default function handleGridoutOfBounds(
    gridMoving,
    top,
    right,
    bottom,
    left,
    width,
    height,
    parentProps,
    setParentElements,
    setGrandParentElements,
    level
) {
    console.log(level)
    if (parentProps.level === 0) {
        return true
    }
    if (!setParentElements) {
        return false
    }
    if (!setGrandParentElements) {
        return false
    }

    setParentElements((prevElements) => {
        const existingElementIndex = prevElements.findIndex((element) => element.props.id === gridMoving.id)
        if (existingElementIndex === -1) {
            // Element not found, possibly already moved; prevent double execution.
            return prevElements
        }

        const lastElement = prevElements[existingElementIndex]
        const newElements = prevElements.filter((element, index) => index !== existingElementIndex)

        // Move to grandparent elements with a check to avoid duplicates (not shown here but involves ensuring unique keys or identifiers).
        setGrandParentElements((prevGrandElements) => {
            // Check if the element is already added to prevent duplicates.
            const isAlreadyAdded = prevGrandElements.some((el) => el.props.id === gridMoving.id)
            const newStyle = calculateMovement(
                gridMoving,
                top,
                right,
                bottom,
                left,
                width,
                height,
                parentProps.parentRef,
                parentProps.parentSizeX,
                parentProps.parentSizeY,
                parentProps.parentProps,
                parentProps.setParentElements
            )
            console.log("newestStyle", newStyle)
            if (!isAlreadyAdded) {
                return [
                    ...prevGrandElements,

                    <Grid
                        {...lastElement.props}
                        parentProps={parentProps.parentProps}
                        size={{ width: width, height: height }}
                        parentRef={parentProps.parentRef}
                        parentSizeX={parentProps.parentSizeX}
                        parentSizeY={parentProps.parentSizeY}
                        setParentElements={parentProps.setParentElements}
                        childStyle={newStyle}
                        level={parentProps.level}
                        key={lastElement.key || "some-unique-key"}
                    />,
                ]
            }
            return prevGrandElements
        })

        return newElements
    })
}
