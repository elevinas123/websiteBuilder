
import parse from "html-react-parser"
import Grid from "../Grid"
import { v4 as uuidv4 } from "uuid"
import calculateNewStyle from "./calculateNewStyle"
export default function codeToDesign(code, allElements, gridPixelSize) {
    const parsedCode = parse(code) // Assuming parse is a function you have defined
    console.log(parsedCode)

    // Assuming getAllObjects is a function you've defined that extracts all objects from parsed code
    let allObj = getAllObjects(parsedCode)
    const newElements = { ...allElements }

    // Start the recursive processing
    console.log(newElements)
    processObjects(allObj, "main-webGrid", newElements, gridPixelSize)

    console.log(newElements)
    return newElements // Assuming you want to return the new elements
}
function processObjects(objects, parentId, newElements, gridPixelSize) {
    if (objects === null) return
    let accumulatedTop = 0
    for (let obj of objects) {
        const id = uuidv4()
        if (obj.props.children) {
            // If there are children, recurse with the children
            processObjects(getAllObjects(obj.props.children), id, newElements, gridPixelSize, accumulatedTop)
        } else {
            return
        }

        if (obj.props.className) {
            continue // Skip if className exists
        } else {
            
            const width = 50
            const height = 50
            accumulatedTop += height
            const padding = {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
            }
            const newStyle = calculateNewStyle(0, accumulatedTop, width, height, gridPixelSize)
            let grid = createNewGrid(id, parentId, accumulatedTop, 0, width, height, padding, newStyle)
            newElements[id] = grid
            newElements[parentId].children = [...newElements[parentId].children, id]
        }
    }
}

const getAllObjects = (arr) => {
    if (typeof arr === "string") return null
    return arr.filter(i => isObejct(i))
}

function isObejct(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Function)
}
const createNewGrid = (id, parentId, top, left, width, height, padding, newStyle) => {
    return {
        item: <Grid key={id} className="bg-red-500" id={id} childStyle={newStyle}></Grid>,
        id: id,
        width,
        height,
        left: left,
        top: top,
        css: {
            width: "w-1",
            height: "h-1",
        },
        style: newStyle,
        text: "",
        padding,
        parent: parentId,
        children: [],
    }
}