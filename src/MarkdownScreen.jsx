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
    const [currentElement, setCurrentElement] = useState({ id: "", parentId: null })

    const handleChange = async (value, event) => {
        let id = currentElement.id || uuidv4() // Simplify ID assignment

        // Handle opening tag "<"
        if (event.changes[0].text === "<") {
            const isNewElement = !currentElement.id || !(id in allTextElements)
            const parentId = currentElement.id
            const newElement = {
                id: id,
                range: event.changes[0].range,
                text: "<",
                tag: "",
                parentId: parentId,
                children: [],
            }

            if (isNewElement) {
                setCurrentElement({ id: id, parentId: parentId })
            } else {
                // Link the new element as a child of the current element if it's not a new element
                newElement.parentId = currentElement.id
                allTextElements[currentElement.id].children.push(id)
            }

            setAllTextElements((prev) => ({ ...prev, [id]: newElement }))
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

            // Handle closing of tag ">"
            if (event.changes[0].text === ">") {
                if (!tagName) {
                    // Extract tag name and append closing tag if it's the end of an opening tag
                    tagName = updatedText.match(/<(\w+)/)[1]
                    const closingTag = `</${tagName}>`
                    appendClosingTag(id, closingTag, event)
                    updatedText += closingTag
                }
            }

            // Update element text and range
            setAllTextElements((prev) => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    range: updateRange(prev[id].range, event.changes[0]),
                    text: updatedText,
                    tag: tagName,
                },
            }))

            // Reset current element if it's a closing tag
            if (event.changes[0].text === ">" && allTextElements[id].tag) {
                setCurrentElement({ id: allTextElements[id].parentId, parentId: null })
            }
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
