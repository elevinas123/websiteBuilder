export function calculateIntersectLines(elementMovedId, trueLeft, trueTop, trueWidth, trueHeight, allElements, allPositions, setAllPositions) {
    let pId = allElements[elementMovedId].parent
    while (pId !== null) {
        let ell = allElements[pId]
        trueLeft += ell.left
        trueTop += ell.top
        trueLeft += ell.padding.left
        trueTop += ell.padding.top
        pId = ell.parent
    }
    let elementPositions = recurseThroughChildren(elementMovedId, trueLeft, trueTop, allElements)
    elementPositions[elementMovedId] = { left: trueLeft, top: trueTop, width: trueWidth, height: trueHeight }
    let linesCrossing = [];

    const tolerance = 0.3 // Pixels within which elements are considered aligned
    Object.entries(elementPositions).forEach(([id, element]) => {
        console.log("element", element)
        Object.entries(allPositions).forEach(([someElementId, someElement]) => {
            if (id === someElementId) return // Skip if comparing the same element

            // Calculate right and bottom for the current and compared element
            const elementRight = element.left + element.width
            const elementBottom = element.top + element.height
            const someElementRight = someElement.left + someElement.width
            const someElementBottom = someElement.top + someElement.height

            // Adjusting checks for horizontal lines with tolerance
            const isTopAligned = Math.abs(someElement.top - element.top) <= tolerance
            const isBottomAlignedWithTop = Math.abs(someElementBottom - element.top) <= tolerance
            const isTopAlignedWithBottom = Math.abs(elementBottom - someElement.top) <= tolerance

            if (isTopAligned || isBottomAlignedWithTop || isTopAlignedWithBottom) {
                const minLeft = Math.min(element.left, someElement.left)
                const maxRight = Math.max(elementRight, someElementRight)
                linesCrossing.push({
                    type: "horizontal",
                    at: isTopAligned
                        ? Math.floor(someElement.top - 2)
                        : isBottomAlignedWithTop
                          ? Math.floor(someElement.top - 2)
                          : Math.floor(someElementBottom - 2),
                    start: minLeft,
                    end: maxRight,
                })
            }

            // Adjusting checks for vertical lines with tolerance
            const isLeftAligned = Math.abs(someElement.left - element.left) <= tolerance
            const isRightAlignedWithLeft = Math.abs(someElementRight - element.left) <= tolerance
            const isLeftAlignedWithRight = Math.abs(elementRight - someElement.left) <= tolerance
            console.log("elllLeft", someElementRight, element.left)
            console.log("isRightAlignedWithLeft", Math.abs(someElementRight - element.left))
            console.log("isLeftAlignedWithRight", Math.abs(elementRight - someElement.left))
            if (isLeftAligned || isRightAlignedWithLeft || isLeftAlignedWithRight) {
                const minTop = Math.min(element.top, someElement.top)
                const maxBottom = Math.max(elementBottom, someElementBottom)
                linesCrossing.push({
                    type: "vertical",
                    at: isLeftAligned
                        ? Math.floor(someElement.left - 2)
                        : isBottomAlignedWithTop
                          ? Math.floor(someElement.left - 2)
                          : Math.floor(someElementRight - 2),
                    start: minTop,
                    end: maxBottom,
                })
            }
        })

    })
    let deduplicatedLines = deduplicateAndExtendLines(linesCrossing);
    setAllPositions((positions) => ({
        ...positions,
        ...elementPositions
    }))
    console.log("linesCrossing", linesCrossing)
    console.log("deduplicatedLines", deduplicatedLines)
    return deduplicatedLines
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


const deduplicateAndExtendLines = (lines) => {
    let extendedLines = [];

    lines.forEach(line => {
        let found = extendedLines.find(extLine => extLine.type === line.type && extLine.at === line.at);
        if (found) {
            // Extend the existing line
            found.start = Math.min(found.start, line.start);
            found.end = Math.max(found.end, line.end);
        } else {
            // Add the new line
            extendedLines.push(line);
        }
    });

    return extendedLines;
}