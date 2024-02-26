import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom } from "./atoms"
import { debounce, transform } from "lodash" // Assuming you are using lodash for debouncing
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

    const [textElements, setTextElements] = useState({
        "main-webGrid": {
            id: "main-webGrid",
            tagName: "div",
            range: {
                startColumn: 1,
                startLineNumber: 1,
                endColumn: 1, // Adjust based on actual content length
                endLineNumber: 1,
            },
            parts: [
                {
                    // Combining start tag, attributes, and closing bracket into one part
                    type: "startTag",
                    range: {
                        startColumn: 1,
                        startLineNumber: 1,
                        endColumn: 1, // Adjust based on actual content length
                        endLineNumber: 1,
                    },
                    text: "",
                },
                {
                    type: "content",
                    range: {
                        startColumn: 1,
                        startLineNumber: 1,
                        endColumn: 1, // Adjust if content is longer
                        endLineNumber: 1,
                    },
                    text: "",
                },
                {
                    type: "endTag",
                    range: {
                        startColumn: 1,
                        startLineNumber: 1,
                        endColumn: 1,
                        endLineNumber: 1,
                    },
                    text: "",
                },
            ],
            startTagDone: false,
            tagCompleted: false,
            currentTag: "content",
            children: [],
            parent: null,
        },
    })

    function calculateLeadingWhitespace(text) {
        // Split the text into lines
        const lines = text.split(/\r?\n/)

        // Map each line to its leading whitespace count
        const whitespaceCounts = lines.map((line) => {
            // Match leading spaces or tabs and return their length
            const match = line.match(/^[\s\t]*/)
            return match ? match[0].length : 0
        })

        return whitespaceCounts
    }
    const findElementEdited = (range, children, elementId, textElements) => {
        for (let i = children.length - 1; i >= 0; i--) {
            let item = textElements[children[i]]
            let isElementOpen = item.tagCompleted
            if (isEditInRange(range, item.range, isElementOpen)) {
                if (item.children && item.children.length > 0) {
                    return findElementEdited(range, item.children, item.id, textElements)
                }
                return item.id // Return this ID if no deeper match is found
            }
        }
        return elementId // Return the initial or last matched elementId if no deeper element matches
    }
    const updatePart = (tag, id, editRange, text) => {
        let elements = { ...textElements }
        const whiteSpace = calculateLeadingWhitespace(text)
        let endColumn = whiteSpace.length > 1 ? whiteSpace[1] : elements[id].parts[0].range.endColumn + text.length
        let endLineNumber = whiteSpace.length + elements[id].parts[0].range.startLineNumber - 1
        let partUpdated = false
        for (let part of elements[id].parts) {
            if (tag === part.type) {
                let newPart = {
                    ...part,
                    range: {
                        ...part.range,
                        endColumn: endColumn,
                        endLineNumber: endLineNumber,
                    },
                    text: part.text + text,
                }
                partUpdated = true
                
            } else {
                if (!partUpdated) continue
                let newPart = {
                    ...part,
                    range: {
                        startColumn: endColumn,
                        startLineNumber: endLineNumber,
                        endLineNumber: part.startLineNumber * 2 - endLineNumber,
                        endColumn: part.startLineNumber * 2 - endColumn,
                    },
                }
                endLineNumber = part.startLineNumber * 2 - endLineNumber
                endColumn = part.startLineNumber * 2 - endColumn
                part = newPart
            }
        }
        console.log("elements", elements)
        setTextElements({ ...elements })
    }

    function isEditInRange(editRange, partRange, isElementOpen = false) {
        // The existing checks
        const editStartsAfterPartStart =
            editRange.startLineNumber > partRange.startLineNumber ||
            (editRange.startLineNumber === partRange.startLineNumber && editRange.startColumn >= partRange.startColumn)

        const editEndsBeforePartEnd =
            editRange.endLineNumber < partRange.endLineNumber ||
            (editRange.endLineNumber === partRange.endLineNumber && editRange.endColumn <= partRange.endColumn)

        const editOverlapsPart = editRange.startLineNumber < partRange.endLineNumber && editRange.endLineNumber > partRange.startLineNumber

        // Adjust for unclosed elements: consider the edit in range if it's right at the end of an open element
        const editAtOpenElementEnd =
            isElementOpen &&
            ((editRange.startLineNumber === partRange.endLineNumber && editRange.startColumn >= partRange.endColumn) ||
                editRange.startLineNumber > partRange.endLineNumber)

        return (editStartsAfterPartStart && editEndsBeforePartEnd) || editOverlapsPart || editAtOpenElementEnd
    }

    const handleChange = (value, event) => {
        const editedId = findElementEdited(event.changes[0].range, textElements["main-webGrid"].children, "main-webGrid", textElements)
        const textWritten = event.changes[0].text
        let elements = { ...textElements }
        let element = elements[editedId]
        updatePart(element.currentTag, editedId, event.changes[0].range, textWritten)
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
        console.log("allTextElements", textElements)
        console.log("textSending", text)
        console.log("textSending", editorRef.current)
    }, [textElements])

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
