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

            if (!element.tag) {
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
                    console.log("continued", element, changeRange, elRange)
                    continue // Skip this element, as the change is outside its column range
                }

                // If this element has children, search within them
                if (element.children && element.children.length > 0) {
                    const foundInChild = findElementByChangeRange(changeRange, element.children)
                    console.log("foundInChild", foundInChild)
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
                tag: false,
                parts: [
                    { type: "startTag", range: event.changes[0].range, content: "" },
                    { type: "atributes", range: event.changes[0].range, content: "" },
                    { type: "text", range: event.changes[0].range, content: "" },
                    { type: "endTag", range: event.changes[0].range, content: "" },
                ],
                currentPart: "text",
                parentId: null,
                startTageNameDone: false,
                children: [],
            }
            id = "main-element"
        } else {
            let ell = findElementByChangeRange(event.changes[0].range, allTextElements["main-element"].children)
            console.log("ell", ell)
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
                tag: false,
                parts: [
                    { type: "startTag", range: event.changes[0].range, content: "" },
                    { type: "atributes", range: event.changes[0].range, content: "" },
                    { type: "text", range: event.changes[0].range, content: "" },
                    { type: "endTag", range: event.changes[0].range, content: "" },
                ],
                parentId: id,
                currentPart: "startTag",
                children: [],
                startTageNameDone: false,
            }

            allTextElements[id].children.push(newElement.id) // Link to "main-element" as a child

            setAllTextElements((prev) => ({ ...prev, [newElement.id]: newElement }))
            updateParentRanges(id, { type: "addLine", linesAdded: 0, columnsAdded: 1 })
            return
        }

        if (!allTextElements[id]) return

        // Example conceptual check for a backspace action
        if (event.changes[0].text === "" && event.changes[0].rangeLength > 0) {
            // Backspace action detected

            return
        }

        // Append text for existing elements
        if (id && event.changes[0].text !== "<") {
            console.log("text", allTextElements)
            console.log("id", id)

            let updatedText = allTextElements[id].text
            let startTagText = allTextElements[id].startTag
            if (allTextElements[id].startTageNameDone) {
                updatedText += event.changes[0].text
            } else {
                startTagText += event.changes[0].text
            }
            let tagName = allTextElements[id].startTag
            let endTag = false
            let itemLength = event.changes[0].text.length
            let currentPart = allTextElements[id].currentPart
            // Handle closing of tag ">"
            if (event.changes[0].text === " " && currentPart === "startTag") {
                currentPart = "atributes"
            }
            if (event.changes[0].text === ">") {
                if (!allTextElements[id].tag) {
                    // Extract tag name and append closing tag if it's the end of an opening tag
                    const closingTag = `</${tagName.slice(1)}>`
                    console
                    appendClosingTag(id, closingTag, event)
                    itemLength += closingTag.length
                    endTag = true
                    currentPart = "text"
                }
            }

            const linesAdded = (event.changes[0].text.match(/\r\n/g) || []).length
            setAllTextElements((prev) => {
                const element = prev[id]

                // Assuming each part of the element is represented in a list for iteration
                // Each part has { type: "startTag" | "attributes" | "text" | "endTag", range: {}, content: "" }
                const parts = element.parts

                let updateFollowingRanges = false

                parts.forEach((part) => {
                    if (isEditInRange(event.changes[0].range, part.range)) {
                        // Update this part's content and range
                        part.content += event.changes[0].text // Simplify for illustration
                        part.range.endColumn += itemLength // Adjust based on actual logic needed
                        part.range.endLineNumber += linesAdded
                        updateFollowingRanges = true
                    } else if (updateFollowingRanges) {
                        // Update the range for all subsequent parts
                        part.range.startColumn += itemLength
                        part.range.endColumn += itemLength
                        part.range.startLineNumber += linesAdded
                        part.range.endLineNumber += linesAdded
                    }
                })

                return {
                    ...prev,
                    [id]: {
                        ...prev[id],
                        range: {
                            ...prev[id].range,
                            endColumn: prev[id].range.endColumn + itemLength,
                            endLineNumber: prev[id].range.endLineNumber + linesAdded,
                        },
                        parts: parts,
                        startTag: startTagText,
                        startTageNameDone: event.changes[0].text === " " || endTag ? true : prev[id].startTageNameDone,
                        text: updatedText,
                        tag: endTag ? true : prev[id].tag,
                        endTag: endTag ? `</${tagName.slice(1)}>` : prev[id].endTag,
                    },
                }
            })
            // Reset current element if it's a closing tag
            console.log("event.changes[0].text", JSON.stringify(event.changes[0].text))
            updateParentRanges(id, {
                type: "addLine",
                columnsAdded: 1,
                linesAdded: linesAdded,
            })
        }
    }
    function isEditInRange(editRange, partRange) {
        // Simplified check; extend logic to accurately determine if the edit is within the part's range
        return (
            editRange.startLineNumber >= partRange.startLineNumber &&
            editRange.startLineNumber <= partRange.endLineNumber &&
            editRange.startColumn >= partRange.startColumn &&
            editRange.endColumn <= partRange.endColumn
        )
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
        if (!childElement || !childElement.parentId) return // Ensure child has a parent

        const parentElement = allTextElements[childElement.parentId]
        if (!parentElement) return // Ensure parent exists

        // Directly adjust the parent's overall range if needed
        if (changeDetails.type === "addLine") {
            parentElement.range.endLineNumber += changeDetails.linesAdded
            parentElement.range.endColumn += changeDetails.columnsAdded
        }
        // Assume additional change types could be handled here
        if (!parentElement || parentElement.parts.length < 4) throw new Error("wtf man turi but 4")

        // Directly update the third part's (second to last) end range
        let thirdPart = parentElement.parts[2]
        thirdPart.range.endColumn += changeDetails.columnsAdded
        thirdPart.range.endLineNumber += changeDetails.linesAdded

        // For the fourth part (last), update both start and end ranges
        let fourthPart = parentElement.parts[3]
        fourthPart.range.startColumn += changeDetails.columnsAdded
        fourthPart.range.endColumn += changeDetails.columnsAdded
        fourthPart.range.startLineNumber += changeDetails.linesAdded
        fourthPart.range.endLineNumber += changeDetails.linesAdded

        // Update the parent element in state
        setAllTextElements((prev) => ({
            ...prev,
            [parentElement.id]: parentElement,
        }))

        // Recursively update the range for the parent's parent, if any
        updateParentRanges(parentElement.id, changeDetails)
    }

    useEffect(() => {
        console.log("allTextElements", allTextElements)
        console.log("textSending", text)
        console.log("textSending", editorRef.current)
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
