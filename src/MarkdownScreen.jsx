import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom } from "./atoms"
import { debounce, every, transform } from "lodash" // Assuming you are using lodash for debouncing
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react"
// eslint-disable-next-line no-undef
import { diff } from "jsondiffpatch"
import { v4 as uuidv4 } from "uuid"
import { createNewGrid } from "./functions/gridCRUD"
import calculateNewStyle from "./functions/calculateNewStyle"
import { parseHTML } from "./parseHTML"

export default function MarkdownScreen() {
    const [text, setText] = useState("")
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridPixelsize, setGridPixelSize] = useAtom(gridPixelSizeAtom)

    const [previousAst, setPreviousAst] = useState(parseHTML("<div></div>"))
    const mainId = "main-webGrid"
    const editorRef = useRef(null)

    useEffect(() => {
        console.log("allElements", allElements)
    }, [allElements])

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor
    }

    function elementToHTML(elementId, allElements, indentLevel = 0) {
        // Base case: if the element does not exist in allElements
        if (!allElements[elementId]) {
            return ""
        }

        const element = allElements[elementId]
        const style = element.style ? styleObjectToCSS(element.css) : "" // Fixed to element.style from element.css
        const indent = " ".repeat(indentLevel * 4) // Generate indentation

        // Start the div tag with id, class, and style, with proper indentation
        let html = `${indent}<div  class="${element.className || ""}" style="${style}">\n`

        // Recursively add children elements with increased indentation
        if (element.children && element.children.length > 0) {
            element.children.forEach((childId) => {
                html += elementToHTML(childId, allElements, indentLevel + 1)
            })
        }

        // Close the div tag with proper indentation
        html += `${indent}</div>\n`

        return html
    }

    // Helper function to convert style object to CSS string
    function styleObjectToCSS(style) {
        return Object.entries(style)
            .map(([key, value]) => {
                return `${value}`
            })
            .join(" ")
    }

    // Debounce the writeCode function
    const writeCode = useCallback(
        debounce((elements) => {
            // Assuming mainId is defined and points to the root of your elements structure
            let code = elementToHTML(mainId, elements)
            //setText(code) // Update the state with the generated code
        }, 200),
        [] // Dependencies array is empty, meaning the debounced function will be created once per component mount
    )

    useEffect(() => {
        writeCode(allElements)
        // Cleanup function to cancel the debounce on component unmount or before re-running the effect
        return () => writeCode.cancel()
    }, [allElements, writeCode])

    const handleChange = (value, event) => {
        console.log("value", value)
        value = `<div>${value}</div>`
        const newAst = parseHTML(value)
        console.log("oldAst", previousAst)
        console.log("newAst1", newAst)

        const diffedAst = diff(previousAst, newAst)
        if (!diffedAst) return
        console.log("diff", diffedAst)
        console.log("allElements", allElements)
        let updateThings = applyChangesFromDiff(diffedAst, allElements)
        console.log("updateThings", updateThings)
        console.log("allELements pradzioj", allElements)
        updateAllElements(updateThings, allElements, setAllElements)
        setPreviousAst(newAst)
    }

    function applyChangesFromDiff(diff, allElements, allElementsChanges = [], parentId = null, index = 0, place = "tagName") {
        Object.entries(diff).forEach(([key, change]) => {
            if (change === undefined || key === "_t") {
                // Skip undefined changes and array change markers
                return
            }
            console.log("change", change)

            let newIndex = index
            let newPlace = place
            if (isInt(key)) newIndex = parseInt(key)

            // Adjust the handling based on your structure. Assuming 'attribs' for attributes
            if (key === "attribs") newPlace = "attribs"
            if (key === "tagName") newPlace = "tagName"

            const visualId =
                parentId !== null ? (allElements[parentId].children[newIndex] ? allElements[parentId].children[newIndex] : undefined) : "main-webGrid"
            console.log("parentId", parentId)
            console.log("visualId", visualId)
            console.log("visualId", newIndex)
            console.log("visualId", allElements[parentId])
            if (Array.isArray(change)) {
                // Handle modifications, deletions, or additions based on change array structure
                const action = determineAction(change)
                console.log("this change", change)
                if (action === "add") {
                    allElementsChanges.push({ action, visualId: null, change: change[0], parentId: visualId, newIndex, newPlace })
                } else if (action === "modify") {
                    allElementsChanges.push({ action, visualId, change: { place: key, changed: change }, parentId, newIndex, newPlace })
                } else if (action === "delete") {
                    allElementsChanges.push({ action, visualId, change: change[0], parentId, newIndex, newPlace })
                }
            } else if (typeof change === "object") {
                // Nested changes within properties like childNodes or attribs
                const childId = visualId
                applyChangesFromDiff(change, allElements, allElementsChanges, childId, newIndex, newPlace)
            }
        })

        return allElementsChanges
    }
    function processStyles(attribs) {
        return Object.entries(attribs || {}).reduce((acc, [attrName, attrValue]) => {
            if (attrName === "class") {
                acc.className = attrValue // Handle class attribute
            }
            return acc
        }, {})
    }

    function processChildNodes(childNodes, parentId, elements, offset) {
        let text = ""
        let childrenIds = []
        let totalHeight = offset

        childNodes.forEach((child) => {
            if (child.nodeType === 3) {
                // Text node
                text += child.textContent
                return
            }
            const [updatedElements, childId, , h] = addElementRecursively(child, parentId, elements, 1, totalHeight)
            totalHeight += h
            Object.assign(elements, updatedElements)
            childrenIds.push(childId)
        })

        return { text, childrenIds, totalHeight }
    }

    function addElementRecursively(change, parentId, elements = {}, offsetLeft = 1, offsetTop = 1) {
        const newElementId = uuidv4()
        const styles = processStyles(change.attribs)
        const { text, childrenIds, totalHeight } = processChildNodes(change.childNodes || [], newElementId, elements, offsetTop)
        const elementWidth = 100,
            elementHeight = 100

        elements[newElementId] = createNewGrid(
            newElementId,
            parentId,
            offsetLeft,
            totalHeight,
            elementWidth,
            elementHeight,
            { top: 0, left: 0, bottom: 0, right: 0 },
            gridPixelsize,
            childrenIds
        )

        return [elements, newElementId, elementWidth, elementHeight]
    }

    function handleElementAddition(changeDetails, parentId, allElements, updatedElements) {
        let elementsIds = []
        let totalHeight = calculateStartingHeight(parentId, 0, allElements) + 1 // +1 to start from the next possible height
        let totalWidth = 1 // Assuming a starting width

        const [newElements, childId, , h] = addElementRecursively(changeDetails, parentId, updatedElements, totalWidth, totalHeight)
        Object.assign(updatedElements, newElements)
        elementsIds.push(childId)
        totalHeight += h

        return { updatedElements, elementsIds, totalHeight }
    }

    function updateAllElements(changes, allElements, setAllElements) {
        let updatedElements = { ...allElements }

        changes.forEach(({ action, visualId, change: changeDetails, parentId }) => {
            if (action === "add" && changeDetails.nodeType !== 3) {
                // Skip text nodes for "add" actions
                if (!parentId) parentId = "main-webGrid"
                const { updatedElements: newUpdatedElements, elementsIds: newElementsIds } = handleElementAddition(
                    changeDetails,
                    parentId,
                    allElements,
                    updatedElements
                )
                newUpdatedElements[parentId].children = [...newUpdatedElements[parentId].children, ...newElementsIds]
                updatedElements = newUpdatedElements
            } else if (action === "modify") {
                updatedElements = handleElementModify(changeDetails, visualId, updatedElements)
            } else {
                console.warn("Unknown action type or unsupported change detected:", action)
            }
        })
        console.log("updatedElements", updatedElements)

        setAllElements(updatedElements)
    }
    const handleElementModify = (changeDetails, id, updatedElements) => {
        if (!id) return updatedElements
        if (changeDetails.place === "classname") {
            const cssClasses = tailwindClassToCSS(changeDetails.changed[1])
            let width = cssClasses.width?cssClasses.width: updatedElements[id].width
            let height = cssClasses.height?cssClasses.height: updatedElements[id].height
            let top =  updatedElements[id].top
            let left = updatedElements[id].left
            let bg = cssClasses.bg ? cssClasses.bg : updatedElements[id].backgroundColor
            const newStyles = calculateNewStyle(left, top, width, height, gridPixelSizeAtom, bg)
            return {
                ...updatedElements,
                [id]: {
                    ...updatedElements[id],
                    ...cssClasses,
                    style: {
                        ...updatedElements[id].style,
                        ...newStyles,
                    },
                },
            }
        } else if (changeDetails.place === "text") {
            return {
                ...updatedElements,
                [id]: {
                    ...updatedElements[id],
                    text: changeDetails.changed[1],
                },
            }
        } else if (changeDetails.place === "tagName") {
            //I will add tag functionality later
            return updatedElements
        }

        return updatedElements
    }
    function tailwindClassToCSS(classNames) {
        // Basic scale to pixel conversion for demonstration
        const unitToPx = (unit) => unit * 4

        // Handle special color mappings
        const colorMappings = {
            "red-500": "#f56565", // Example color mapping
            // Define additional color mappings as needed
        }

        // Expanded regex to capture classes like 'bg-red-500'
        const regex = /^([a-z]+(?:-[a-z]+)*?)-(\d+|[a-z]+\-\d+)$/

        // Initial CSS styles object
        let styles = {}

        classNames.split(" ").forEach((className) => {
            const match = className.match(regex)
            if (!match) return

            const [, type, value] = match

            // Custom handling for colors
            if (type.startsWith("bg") && colorMappings[value]) {
                styles["bg"] = colorMappings[value]
                return
            }

            // Handling for numeric values
            if (!isNaN(value)) {
                const cssValue = unitToPx(parseInt(value))
                // Direct mapping for simplified demonstration
                const mappings = {
                    w: "width",
                    h: "height",
                   
                    // Add more mappings as needed
                }

                Object.entries(mappings).forEach(([key, cssProperty]) => {
                    if (type.startsWith(key)) {
                        styles[cssProperty] = cssValue
                    }
                })
            }
        })

        return styles
    }




    const calculateStartingHeight = (parentId, itemIndex, allELements) => {
        let minHeight = 0
        for (let i = 0; i < itemIndex; i++) {
            minHeight += allElements[allELements[parentId].children[i]].height
        }
        return minHeight
    }

    function extractPropertiesForModification(changeDetails) {
        // Assuming changeDetails contains the updated properties for the element
        // This function should extract these properties and return an object that can be
        // used to update the element. Adjust according to the structure of your changeDetails.
        return changeDetails.reduce((acc, curr) => {
            const [propName, propValue] = curr
            acc[propName] = propValue
            return acc
        }, {})
    }

    function isInt(value) {
        return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))
    }

    function determineAction(change) {
        if (change.length === 1) return "add"
        if (change.length === 2) return "modify"
        if (change.length === 3 && change[2] === 0) return "delete"
        return "unknown"
    }

    const addVisual = (id, change, allElements) => {
        console.log("addVisuals", id, change)
        return {
            ["labas"]: {
                id: id,
                change: change,
                parent: "parent",
            },
        }
    }
    const modifyVisual = (id, change, allElements) => {
        console.log("modifyVisual", id, change)
        return {
            ["modifyVisual"]: {
                id: id,
                change: change,
                parent: "parent",
            },
        }
    }
    const deleteVisual = (id, change, allElements) => {
        console.log("deleteVisual", id, change)
        return {
            ["deleteVisual"]: {
                id: id,
                change: change,
                parent: "parent",
            },
        }
    }

    return (
        <div className="w-full">
            <div className=" ml-10 mt-10 w-auto">
                <Editor height="90vh" onChange={handleChange} onMount={handleEditorMount} value={text} defaultLanguage="html" theme="vs-dark" defaultValue="" />
            </div>
        </div>
    )
}
