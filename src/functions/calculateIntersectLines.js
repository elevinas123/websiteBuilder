export function calculateIntersectLines(elementMovedId, allElements, allPositions) {
    let trueLeft = allElements[elementMovedId].left
    let trueTop = allElements[elementMovedId].top
    let pId = allElements[elementMovedId].parent
    while (pId !== null) {
        let ell = allElements[pId]
        trueLeft += ell.left 
        trueTop += ell.top 
        pId = ell.parent
    }
    let elementPositions = recurseThroughChildren(elementMovedId, trueLeft, trueTop, allElements)
    Object.entries(elementPositions).forEach(([id, element]) => {
        console.log("element", element)
        let linesCrossing = []

        Object.entries(allPositions).forEach(([someElementId, someElement]) => {
            // Skip if comparing the same element
            if (id === someElementId) return

            // Calculate right and bottom for the current and compared element
            const elementRight = element.left + element.width
            const elementBottom = element.top + element.height
            const someElementRight = someElement.left + someElement.width
            const someElementBottom = someElement.top + someElement.height

            // Top alignment
            if (someElement.top === element.top) {
                linesCrossing.push([id, someElementId, element.top, "horizontal"])
            }

            // Top touching Bottom
            if (someElementBottom === element.top) {
                linesCrossing.push([id, someElementId, element.top, "horizontal"])
            }

            // Bottom touching Top
            if (elementBottom === someElement.top) {
                linesCrossing.push([id, someElementId, elementBottom, "horizontal"])
            }

            // Left alignment
            if (someElement.left === element.left) {
                linesCrossing.push([id, someElementId, element.left, "vertical"])
            }

            // Left touching Right
            if (someElementRight === element.left) {
                linesCrossing.push([id, someElementId, element.left, "vertical"])
            }

            // Right touching Left
            if (elementRight === someElement.left) {
                linesCrossing.push([id, someElementId, elementRight, "vertical"])
            }

            // Right alignment
            if (elementRight === someElementRight) {
                linesCrossing.push([id, someElementId, elementRight, "vertical"])
            }

            // Bottom alignment
            if (elementBottom === someElementBottom) {
                linesCrossing.push([id, someElementId, elementBottom, "horizontal"])
            }
        })

        // Log or handle linesCrossing for intersections
        console.log(linesCrossing)
    })
}

export const recurseThroughChildren = (elementMovedId, accumulatedLeft, accumulatedTop, allElements) => {
    let positions = {}

    // Ensure that the element actually has children to iterate over
    if (allElements[elementMovedId].children && allElements[elementMovedId].children.length > 0) {
        allElements[elementMovedId].children.forEach((childId) => {
            // Calculate new accumulated positions for the current child
            const newAccumulatedLeft = accumulatedLeft + allElements[childId].left
            const newAccumulatedTop = accumulatedTop + allElements[childId].top

            // Add the child's accumulated position to the positions object
            positions[childId] = {
                left: newAccumulatedLeft,
                top: newAccumulatedTop,
                width: allElements[childId].width,
                height: allElements[childId].height,
            }

            // Recursively call this function for each child, passing the new accumulated positions
            const childPositions = recurseThroughChildren(childId, newAccumulatedLeft, newAccumulatedTop, allElements)

            // Merge the child positions into the main positions object
            positions = { ...positions, ...childPositions }
        })
    }

    return positions
}
