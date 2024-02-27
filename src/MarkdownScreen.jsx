import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom } from "./atoms"
import { debounce, every, transform } from "lodash" // Assuming you are using lodash for debouncing
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
            //setText(code) // Update the state with the generated code
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
            children: [],
            parent: null,
        },
    })
    const findElementEdited = (range, children, elementId, textElements) => {
        for (let i = children.length - 1; i >= 0; i--) {
            let item = textElements[children[i]]
            let isElementOpen = item.tagCompleted
            if (isEditInRange(range, item.parts[2].range, isElementOpen)) {
                if (item.children && item.children.length > 0) {
                    return findElementEdited(range, item.children, item.id, textElements)
                }
                return item.id // Return this ID if no deeper match is found
            }
        }
        return elementId // Return the initial or last matched elementId if no deeper element matches
    }
    const updatePart = (tag, id, editRange, newText) => {
        let elements = { ...textElements }
        let elementsToUpdate = elements[id].parts

        // Determine initial endColumn and endLineNumber based on the first part
        let { endColumn } = elementsToUpdate[0].range

        // Calculate adjustments based on the newText
        const newLines = newText.match(/\n/g) || []
        const adjustmentForNewLines = newLines.length
        // If adding new text includes new lines, we need to adjust endColumn for the last line of newText
        if (adjustmentForNewLines > 0) {
            endColumn = newText.length - newText.lastIndexOf("\n") - 1
        } else {
            endColumn += newText.length
        }

        let partUpdated = false

        elements[id].parts = elementsToUpdate.map((part) => {
            if (tag === part.type && !partUpdated) {
                partUpdated = true
                console.log("item", part.text[part.text.length - 1])
                if (part.text[part.text.length - 1] === "<") {
                    console.log("cia atejo")
                    if (newText === "/") {
                        newText = "</"
                        tag = "endTag"
                        endColumn--
                        return {
                            ...part,
                            text: part.text.slice(0, -1),
                            range: {
                                ...part.range,
                                endColumn: part.endColumn - 1
                            },
                        }
                    } else if (newText !== " "  || newText !=="/r/n") {
                        endColumn--
                        let newId = uuidv4()
                        setTextElements((i) => ({
                            ...i,
                            [newId]: {
                                id: newId,
                                parts: [
                                    {
                                        // Combining start tag, attributes, and closing bracket into one part
                                        type: "startTag",
                                        range: {
                                            startColumn: endColumn,
                                            startLineNumber: editRange.startLineNumber,
                                            endColumn: endColumn + 2, // Adjust based on actual content length
                                            endLineNumber: editRange.endLineNumber,
                                        },
                                        text: `<${newText}`,
                                    },
                                    {
                                        type: "content",
                                        range: {
                                            startColumn: endColumn + 2,
                                            startLineNumber: editRange.startLineNumber,
                                            endColumn: endColumn + 2, // Adjust based on actual content length
                                            endLineNumber: editRange.endLineNumber,
                                        },
                                        text: "",
                                    },
                                    {
                                        type: "endTag",
                                        range: {
                                            startColumn: endColumn + 2,
                                            startLineNumber: editRange.startLineNumber,
                                            endColumn: endColumn + 2, // Adjust based on actual content length
                                            endLineNumber: editRange.endLineNumber,
                                        },
                                        text: "",
                                    },
                                ],
                                startTagDone: false,
                                tagCompleted: false,
                                children: [],
                                parent: id,
                            },
                        }))
                        return {
                            ...part,
                            text: part.text.slice(0, -1),
                            range: {
                                ...part.range,
                                endColumn: part.endColumn - 1,
                            },
                        }
                    }
                }
                return {
                    ...part,
                    range: {
                        ...part.range,
                        endColumn: adjustmentForNewLines > 0 ? endColumn : part.range.endColumn + newText.length,
                        endLineNumber: part.range.endLineNumber + adjustmentForNewLines,
                    },
                    text: part.text + newText,
                }
            } else if (partUpdated) {
                // Adjust subsequent parts' range
                const startLineNumberAdjustment = part.range.startLineNumber + adjustmentForNewLines
                return {
                    ...part,
                    range: {
                        startColumn: adjustmentForNewLines > 0 ? endColumn : part.range.startColumn + newText.length,
                        startLineNumber: startLineNumberAdjustment,
                        endLineNumber: part.range.endLineNumber + adjustmentForNewLines,
                        endColumn: adjustmentForNewLines > 0 ? endColumn : part.range.endColumn + newText.length,
                    },
                }
            }
            return part
        })

        console.log("Updated elements", elements)
        setTextElements(elements)
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
            ((editRange.startLineNumber === partRange.endLineNumber && editRange.startColumn  === 1+ partRange.endColumn))
        console.log((editStartsAfterPartStart && editEndsBeforePartEnd), editOverlapsPart, editAtOpenElementEnd)
        return (editStartsAfterPartStart && editEndsBeforePartEnd) || editOverlapsPart || editAtOpenElementEnd
    }

    const handleChange = (value, event) => {
        const editedId = findElementEdited(event.changes[0].range, textElements["main-webGrid"].children, "main-webGrid", textElements)
        const textWritten = event.changes[0].text
        let elements = { ...textElements }
        let element = elements[editedId]
        let currPart = element.parts.map((i, index) => [index, isEditInRange(event.changes[0].range, i.range, !element.tagCompleted), i.range, event.changes[0].range])
        console.log(currPart)
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
                    defaultValue=""
                />
            </div>
        </div>
    )
}
