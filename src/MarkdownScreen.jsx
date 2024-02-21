import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom } from "./atoms"
import { debounce } from "lodash" // Assuming you are using lodash for debouncing
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react"
import codeToDesign from "./functions/codeToDesign"
import { parse } from "parse5"
import { v4 as uuidv4 } from "uuid"

export default function MarkdownScreen() {
    const [text, setText] = useState("")
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridPixelsize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [previousHtml, setPreviousHtml] = useState("")
    const mainId = "main-webGrid"
    const editorRef = useRef(null)
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
            setText(code) // Update the state with the generated code
        }, 200),
        [] // Dependencies array is empty, meaning the debounced function will be created once per component mount
    )

    useEffect(() => {
        writeCode(allElements)
        // Cleanup function to cancel the debounce on component unmount or before re-running the effect
        return () => writeCode.cancel()
    }, [allElements, writeCode])

    const [allTextElements, setAllTextElements] = useState({})

    function findElementByChangeRange(changeRange, elements) {
        let lastOpenElement = null // Keep track of the last open (unclosed) element

        const childElements = elements.map((childId) => allTextElements[childId])
        console.log("childelements", childElements)
        for (const element of childElements) {
            const elRange = element.range

            if (element.tag === "") {
                lastOpenElement = element
            }
            console.log("element", element)
            console.log("changeRange", changeRange)
            console.log("elRange", elRange)
            // Check if the change is within the element's range
            if (changeRange.startLineNumber >= elRange.startLineNumber && changeRange.endLineNumber <= elRange.endLineNumber) {
                // Further refine for single-line changes and column ranges
                // If this element is not closed, mark it as the last open element encountered
                console.log("cias", element)
                if (
                    changeRange.startLineNumber === changeRange.endLineNumber &&
                    (changeRange.startColumn < elRange.startColumn || changeRange.endColumn > elRange.endColumn)
                ) {
                    continue // Skip this element, as the change is outside its column range
                }


                // If this element has children, search within them
                if (element.children && element.children.length > 0) {
                    const foundInChild = findElementByChangeRange(changeRange, element.children)
                    if (foundInChild) {
                        return foundInChild // Element found in children
                    }
                }

                // Prefer returning an open element if no children are in range
                if (lastOpenElement) {
                    return lastOpenElement
                }

                // No deeper match found or no children to search, return the current element
                return element
            }
        }

        // If no matching element is found in the provided range, return the last open element if it exists
        return lastOpenElement
    }


    const handleChange = async (value, event) => {
        // Initialize "main-element" if it doesn't exist
        let id
        if (!allTextElements["main-element"]) {
            allTextElements["main-element"] = {
                id: "main-element",
                range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, // Default range, adjust as needed
                text: "",
                tag: "",
                parentId: null,
                children: [],
            }
            id = "main-element"
        } else {
            let ell = findElementByChangeRange(event.changes[0].range, allTextElements["main-element"].children)
            if (ell === null) id = "main-element"
            else {
                id = ell.id
                console.log("id", id)
            }
        }

        // Logic for handling opening tag "<"
        if (event.changes[0].text === "<") {
            const newElement = {
                id: uuidv4(), // Always generate a new ID for new elements
                range: event.changes[0].range,
                text: "<",
                tag: "",
                parentId: id,
                children: [],
            }

            allTextElements[id].children.push(newElement.id) // Link to "main-element" as a child

            setAllTextElements((prev) => ({ ...prev, [newElement.id]: newElement }))
            updateParentRanges(id, { type: "addLine", linesAdded: 1, columnsAdded: 0 })
            return
        }

        if (!allTextElements[id]) return

        // Append text for existing elements
        if (id && event.changes[0].text !== "<") {
            console.log("text", allTextElements)
            console.log("id", id)

            let updatedText = allTextElements[id].text
            if (allTextElements[id].tag) {
                updatedText = insertBeforeClosingTag(updatedText, `</${allTextElements[id].tag}>`, event.changes[0].text)
            } else {
                updatedText += event.changes[0].text
            }
            let tagName = allTextElements[id].tag
            let itemLength = 1
            // Handle closing of tag ">"
            if (event.changes[0].text === ">") {
                if (!tagName) {
                    // Extract tag name and append closing tag if it's the end of an opening tag
                    tagName = updatedText.match(/<(\w+)/)[1]
                    const closingTag = `</${tagName}>`
                    appendClosingTag(id, closingTag, event)
                    updatedText += closingTag
                    itemLength += closingTag.length
                }
            }

            // Update element text and range
            setAllTextElements((prev) => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    range: {
                        ...prev[id].range,
                        endColumn: prev[id].range.endColumn + itemLength,
                    },
                    text: updatedText,
                    tag: tagName,
                },
            }))
            updateParentRanges(id, { type: "addLine", linesAdded: 1, columnsAdded: event.changes[0].text === "\r\n" ? 1 : 0 })
            // Reset current element if it's a closing tag
        }
    }

    function insertBeforeClosingTag(originalText, closingTag, newText) {
        // Insert newText before the existing closing tag within originalText
        const closingTagIndex = originalText.indexOf(closingTag)
        return originalText.slice(0, closingTagIndex) + newText + originalText.slice(closingTagIndex)
    }
    function updateRange(range, change) {
        return {
            ...range,
            endColumn: range.endColumn + 1,
            endLineNumber: change.text === "\r\n" ? range.endLineNumber + 1 : range.endLineNumber,
        }
    }

    function appendClosingTag(id, closingTag, event) {
        editorRef.current.executeEdits("", [
            {
                range: {
                    startLineNumber: event.changes[0].range.endLineNumber,
                    startColumn: event.changes[0].range.endColumn + 1,
                    endLineNumber: event.changes[0].range.endLineNumber,
                    endColumn: event.changes[0].range.endColumn + 1,
                },
                text: closingTag,
            },
        ])
        const newPosition = {
            lineNumber: event.changes[0].range.endLineNumber,
            column: event.changes[0].range.endColumn + 1, // Adjust as needed
        }
        editorRef.current.setPosition(newPosition)
        // Adjust cursor position if necessary
    }
    function updateParentRanges(childId, changeDetails) {
        const childElement = allTextElements[childId]
        if (!childElement || !childElement.parentId) return // Stop if no parent

        const parentElement = allTextElements[childElement.parentId]
        if (!parentElement) return // Safety check

        // Determine if the change affects the parent's range; adjust logic as needed
        if (changeDetails.type === "addLine") {
            parentElement.range.endLineNumber += changeDetails.linesAdded
            parentElement.range.endColumn += changeDetails.columnsAdded
        } // Add other types of changes as needed

        // Update the parent element in state; this assumes a React useState setter or similar
        setAllTextElements((prev) => ({
            ...prev,
            [parentElement.id]: parentElement,
        }))

        // Recursively update the range for the parent's parent, if any
        updateParentRanges(parentElement.id, changeDetails)
    }

    useEffect(() => {
        console.log("allTextElements", allTextElements)
    }, [allTextElements])

    return (
        <div className="w-full">
            <div className=" ml-10 mt-10 w-auto">
                <Editor
                    height="90vh"
                    onChange={handleChange}
                    onMount={handleEditorMount}
                    value={text}
                    defaultLanguage="html"
                    theme="vs-dark"
                    defaultValue="// some comment"
                />
            </div>
        </div>
    )
}
