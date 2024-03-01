import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom } from "./atoms"
import { debounce, every, transform } from "lodash" // Assuming you are using lodash for debouncing
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react"
import { parseFragment } from "parse5"
import { diff } from "jsondiffpatch"

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

    const handleChange = (value, event) => {
        const oldHtml = "<div><div className='bg-red-500'>Labas</div></div>"
        const newHtml1 = "<article><div className='bg-red-500'>Labas</div></article>"
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

        const diffedAst1 = preprocesDiffs(diff(preparedOldAst, preparedNewAst1))
        const diffedAst2 = preprocesDiffs(diff(preparedNewAst1, preparedNewAst2))
        const diffedAst3 = preprocesDiffs(diff(preparedNewAst2, preparedNewAst3))

        console.log("diff", diffedAst1)
        console.log("diff", diffedAst2)
        console.log("diff", diffedAst3)
        console.log("allElements", allElements)
        let updateThings = apllyChangesFromDiff(diffedAst3, allElements)
        console.log("updateThings", updateThings)
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
    function apllyChangesFromDiff(diff, allElements, allElementsChanges = [], parentId = null) {
        Object.entries(diff).forEach(([key, change]) => {
            if (key === "_t") return // Skip array change markers
            if (key === "nodeName") return
            if (key === "tagName") {
                const elementId = parentId === null ? "main-webGrid" : parentId
                let visuals = modifyVisual(elementId, change, allElements)
                const arrayOfObjects = Object.entries(visuals).map(([key, value]) => ({ [key]: value }))

                console.log("visuals", visuals)
                allElementsChanges = [...allElementsChanges, ...arrayOfObjects]
            }
            const visualId = parentId !== null ? allElements[parentId].children[key] : "main-webGrid"
            // Directly use key for top-level elements or find the child key for nested elements
            console.log(visualId)
            console.log(parentId)
            const visual = allElements[visualId]

            if (!visual && parentId) {
                console.error(`Visual with key ${key} not found within parent ${parentId}`)
                return
            }

            if (Array.isArray(change)) {
                // Handling direct modifications, additions, and deletions
                if (change.length === 1) {
                    // Addition logic here
                    let visuals = addVisual(visualId, change, allElements)
                    const arrayOfObjects = Object.entries(visuals).map(([key, value]) => ({ [key]: value }))
                    allElementsChanges = [...allElementsChanges, ...arrayOfObjects]
                } else if (change.length === 2) {
                    // Modification logic here
                    let visuals = modifyVisual(visualId, change, allElements)
                    const arrayOfObjects = Object.entries(visuals).map(([key, value]) => ({ [key]: value }))
                    allElementsChanges = [...allElementsChanges, ...arrayOfObjects]
                } else if (change.length === 3 && change[2] === 0) {
                    // Deletion logic here
                    let visuals = deleteVisual(visualId, change, allElements)
                    const arrayOfObjects = Object.entries(visuals).map(([key, value]) => ({ [key]: value }))
                    allElementsChanges = [...allElementsChanges, ...arrayOfObjects]
                }
            } else if (typeof change === "object" && !change["_t"]) {
                let visuals = modifyVisual(visualId, change, allElements)
                const arrayOfObjects = Object.entries(visuals).map(([key, value]) => ({ [key]: value }))
                allElementsChanges = [...allElementsChanges, ...arrayOfObjects]
            } else {
                let visuals = apllyChangesFromDiff(change, allElements, allElementsChanges, visualId)
                const arrayOfObjects = Object.entries(visuals).map(([key, value]) => ({ [key]: value }))
                allElementsChanges = [...allElementsChanges, ...arrayOfObjects]
            }
        })
        return allElementsChanges
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
