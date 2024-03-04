import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom } from "./atoms"
import { debounce, every, transform } from "lodash" // Assuming you are using lodash for debouncing
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react"
import { parseFragment } from "parse5"
import { diff } from "jsondiffpatch"
import { v4 as uuidv4 } from "uuid"
import { createNewGrid } from "./functions/gridCRUD"
import calculateNewStyle from "./functions/calculateNewStyle"

export default function MarkdownScreen() {
    const [text, setText] = useState("")
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridPixelsize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [previousHtml, setPreviousHtml] = useState("")
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
        const oldHtml = "<div></div>"
        const newHtml1 = "<div><div></div></div>"
        const newHtml2 = "<div><div className='w-10'><div className='bg-red-500'>Labas</div></div><div><div className='bg-red-500'>Labas123</div></div></div>"
        const newHtml3 =
            "<div><div className='w-10'><div className='bg-red-500'>Labas</div></div><div><div className='bg-red-500'>Labas123</div></div><div className='w-10'><div className='bg-red-500'>Testas</div></div></div>"

        const oldAst = parseFragment(oldHtml)
        const newAst1 = parseFragment(newHtml1)
        const newAst2 = parseFragment(newHtml2)
        const newAst3 = parseFragment(newHtml3)
        const preparedOldAst = prepareAstForDiffing(oldAst)
        const preparedNewAst1 = prepareAstForDiffing(newAst1)
        const preparedNewAst2 = prepareAstForDiffing(newAst2)
        const preparedNewAst3 = prepareAstForDiffing(newAst3)
        console.log("oldAst", preparedOldAst)
        console.log("newAst1", preparedNewAst1)
        const diffedAst1 = preprocesDiffs(diff(preparedOldAst, preparedNewAst1))
        const diffedAst2 = preprocesDiffs(diff(preparedOldAst, preparedNewAst2))
        const diffedAst3 = preprocesDiffs(diff(preparedOldAst, preparedNewAst3))

        console.log("diff", diffedAst1)
        console.log("diff", diffedAst2)
        console.log("diff", diffedAst3)
        console.log("allElements", allElements)
        let updateThings = applyChangesFromDiff(diffedAst1, allElements)
        console.log("updateThings", updateThings)
        console.log("allELements pradzioj", allElements)
        updateAllElements(updateThings, allElements, setAllElements)
    }
    const preprocesDiffs = (diff) => {
        return { ...diff.childNodes[0] }
    }
    function prepareAstForDiffing(node) {
        // Clone node to avoid mutating the original AST, omitting non-serializable properties if needed
        let cleanNode = {
            nodeName: node.nodeName,
            tagName: node.tagName,
            attrs: node.attrs,
            // You might want to include or exclude additional properties depending on your needs
        }

        // Recursively process child nodes
        if (node.childNodes && node.childNodes.length) {
            cleanNode.childNodes = node.childNodes.map((child) => prepareAstForDiffing(child))
        }

        // Include any additional properties or transformations here
        // For example, adding text content for text nodes
        if (node.nodeName === "#text") {
            cleanNode.value = node.value
        }

        return cleanNode
    }
    function applyChangesFromDiff(diff, allElements, allElementsChanges = [], parentId = null, index = 0, place = "tagName") {
        Object.entries(diff).forEach(([key, change]) => {
            let newIndex = index
            let newPlace = place
            if (key === "_t" || key === "nodeName") {
                // Skip array change markers and nodeName changes
                return
            }
            if (isInt(key)) newIndex = parseInt(key)
            if (key === "attrs") newPlace = "attrs"
            if (key === "tagName") newPlace = "tagName"

            // Determine whether the key represents an integer index for array changes
            const visualId = parentId !== null ? allElements[parentId].children[key] : "main-webGrid"

            if (Array.isArray(change)) {
                // Determine action based on the change array structure
                const action = determineAction(change)
                // Push the change to allElementsChanges with the correct context
                allElementsChanges.push({ action, visualId, change: change[0], parentId, newIndex, newPlace })
            } else if (typeof change === "object") {
                // For nested changes, call applyChangesFromDiff recursively
                // If the key is an index, it's a nested change within an array child
                const childId = visualId
                applyChangesFromDiff(change, allElements, allElementsChanges, childId, newIndex, newPlace)
            }
        })

        return allElementsChanges
    }
    function addElementRecursively(change, parentId, elements = {}, offsetLeft = 0, offsetTop = 0) {
        const newElementId = uuidv4() // Generate a unique ID for the new element

        let text = ""
        let childrenIds = []
        const elementWidth = 100
        const elementHeight = 100
        let styles = change.attrs.reduce((acc, attr) => {
            // Example: Handle class name or other styles based on attributes
            if (attr.name === "classname") {
                acc.className = attr.value // Adjust based on how you want to use attributes
            }
            return acc
        }, {})

        // Initialize totalHeight with offsetTop for relative positioning
        let totalHeight = 0
        let totalWidth = 0
        if (change.childNodes && change.childNodes.length > 0) {
            change.childNodes.forEach((childChange) => {
                if (childChange.nodeName === "#text") {
                    text += childChange.value // Concatenate text from all text nodes
                    return
                }
                // Recursively add each nested child
                let [updatedElements, childId, w, h] = addElementRecursively(childChange, newElementId, elements, totalWidth, totalHeight)
                totalHeight += h // Update for the next sibling
                console.log(offsetLeft)
                console.log(childChange)
                elements = { ...elements, ...updatedElements }
                childrenIds.push(childId)

                // Assuming each child has a standard height for now
            })
        }

        console.log("clacualting offset", offsetLeft)
        // Use createNewGrid to create the element with calculated positioning and accumulated styles
        

        // Add the new element to the elements collection
        elements = {
            ...elements,
            [newElementId]: {...createNewGrid(
            newElementId,
            parentId,
            offsetLeft,
            offsetTop, // Use initial offsetTop for this element
            elementWidth,
            elementHeight,
            { left: 0, top: 0, right: 0, bottom: 0 },
            gridPixelsize,
            childrenIds,
            "l",
            "red" // Consider dynamic background color if necessary
            ), style: calculateNewStyle(offsetLeft, offsetTop, elementWidth, elementHeight, gridPixelsize)
    }
        }


        return [elements, newElementId, elementWidth, elementHeight]
    }

    function updateAllElements(changes, allElements, setAllElements) {
        // Utilize the existing allElements object directly for updates
        let updatedElements = { ...allElements }
        let elementsIds = []
        changes.forEach((change) => {
            const { action, visualId, change: changeDetails, newIndex } = change
            console.log("changeTotal", change)
            let totalHeight = calculateStartingHeight(visualId, newIndex, allElements)
            let totalWidth = 0

            switch (action) {
                case "add":
                    // Your existing logic for adding elements
                    // Assuming addElementRecursively correctly handles nested additions
                    changeDetails.forEach((nodes) => {
                        let [newElements, childId, w, h] = addElementRecursively(nodes, visualId, updatedElements, totalWidth, totalHeight)
                        updatedElements = { ...updatedElements, ...newElements }
                        elementsIds.push(childId)
                        totalHeight += h
                    })
                    break

                default:
                    console.warn("Unknown action type encountered:", action)
            }
        })
        updatedElements["main-webGrid"] = {
            ...updatedElements["main-webGrid"],
            children: [...updatedElements["main-webGrid"].children, ...elementsIds],
        }
        console.log("updatedElements", updatedElements)
        // Set the updated elements object back to state
        setAllElements(updatedElements)
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
