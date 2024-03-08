import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom, visualsUpdatedAtom } from "./atoms"
import { debounce} from "lodash" // Assuming you are using lodash for debouncing
import Editor, { OnMount, OnChange } from '@monaco-editor/react'; // Adjusted based on your wrapper
import * as monaco from "monaco-editor"
import { Delta, diff } from "jsondiffpatch"
import { Ast, parseHTML, serializeASTtoHTML } from "./functions/parseHTML"
import _ from "lodash"
import { AllElements, GridElement } from "./Types"
import { updateAllElements } from "./functions/codeToVisuals"
import isInt from "./functions/isInt"


interface ChildrenDiff {
    childNodes: {
        [key: number]: Ast[]
        _t?: string
    }
}

export interface Diff {
    _t?: string
    [key: number]: ChildrenDiff
}

export interface Modify {
    action: "add" | "delete" | "modify"
    visualId: string | null
    parentId: string | null
    change: unknown
    newIndex: number
    newPlace: string
}


export default function MarkdownScreen() {
    const [text, setText] = useState("")
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridPixelsize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [visualsUpdate, setVisualsUpdated] = useAtom(visualsUpdatedAtom)
    const [previousAst, setPreviousAst] = useState(parseHTML("<div></div>"))
    const mainId = "main-webGrid"
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

    const debouncedUpdateTheEditor = useCallback(
        debounce((visualsUpdate, previousAst, allElements, setPreviousAst, setText) => {
            if (!visualsUpdate.id) return
            console.log("debounced")
            const pathToElement = createPathToElement(visualsUpdate.id, allElements)
            let updatingAst = JSON.parse(JSON.stringify(previousAst))
            const updatedAst = updateAst(pathToElement, updatingAst, allElements[allElements[visualsUpdate.id].parent].children.length)
            let html = serializeASTtoHTML(updatedAst[0].childNodes)
            console.log("allElements", html)
            console.log("html", html)
            setPreviousAst(updatedAst)
            setText(html)
        }, 300),
        []
    ) // 300ms debounce time, adjust as needed

    useEffect(() => {
        // Call the debounced function within useEffect
        console.log("tryuing to debounce")
        debouncedUpdateTheEditor(visualsUpdate, previousAst, allElements, setPreviousAst, setText)
    }, [visualsUpdate])

    const updateAst = (path: number[], ast: Ast[], amountOfElements: number) => {
        let node = ast[0]
        for (let i = 0; i < path.length - 1; i++) {
            node = node.childNodes[path[i]]
        }
        if (node.childNodes.length >= amountOfElements) {
            console.log("equeal")
            return ast
        } else {
            console.log(JSON.stringify(amountOfElements, null, 2))
            console.log(JSON.stringify(node, null, 2))
            node.childNodes.splice(path[path.length - 1], 0, { attribs: {}, childNodes: [], tagName: "div", textContent: "" })
            console.log(JSON.stringify(node, null, 2))
        }
        console.log("node", node)
        return ast
    }
    const createPathToElement = (id: string, allElements: AllElements) => {
        let currId = id
        let path = []
        while (currId !== "main-webGrid") {
            let parentId = allElements[currId].parent
            if (!parentId) throw new Error("wtf negalima tokio parent id negali  but ne string")
            path.unshift(allElements[parentId].children.indexOf(currId))
            currId = parentId
        }
        return path
    }
    const handleEditorMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor
        // You can now use 'monacoInstance' to access the monaco object if needed
    }

    const handleChange: OnChange = (value, event) => {
        console.log("value", value)
        value = `<div>${value}</div>`
        const newAst = parseHTML(value)
        console.log("oldAst", previousAst)
        console.log("newAst1", newAst)

        const diffedAst= diff(previousAst, newAst)
        if (!diffedAst) return
        console.log("diff", diffedAst)
        let updateThings = applyChangesFromDiff(diffedAst, allElements)
        return
        console.log("updateThings", updateThings)
        console.log("allELements pradzioj", allElements)
        updateAllElements(updateThings, allElements, gridPixelsize, setAllElements)
        setPreviousAst(newAst)
    }
    function isObject(variable: unknown) {
        return typeof variable === "object" && variable !== null && !Array.isArray(variable)
    }
    function applyChangesFromDiff(
        diff: Delta,
        allElements: AllElements,
        allElementsChanges: Modify[] = [] ,
        parentId: string   | null = "main-webGrid",
        visualId: string   | null = "main-webGrid",
        index = 0,
        place = "tagName"
    ) {
        if (!isObject(diff))return allElementsChanges
        Object.entries(diff).forEach(([key, change]) => {
            if (change === undefined || key === "_t") {
                // Skip undefined changes and array change markers
                return
            }
            console.log("change", change)
            console.log("key", key)
            let newIndex = index
            let newPlace = place
            if (isInt(key)) {
                newIndex = parseInt(key)
            }
            if (key === "childNodes") {
                parentId = visualId
                visualId =
                    parentId !== null ? (allElements[parentId].children[newIndex] ? allElements[parentId].children[newIndex] : null) : "main-webGrid"
            }
            // Adjust the handling based on your structure. Assuming 'attribs' for attributes
            if (key === "attribs") newPlace = "attribs"
            if (key === "tagName") newPlace = "tagName"
            console.log("parentId", parentId)
            console.log("visualId", visualId)
            console.log("visualId")
            if (Array.isArray(change)) {
                // Handle modifications, deletions, or additions based on change array structure
                const action = determineAction(change)
                console.log("this change", change)
                if (action === "add") {
                    allElementsChanges.push({ action, visualId: null, change: change[0], parentId: parentId, newIndex, newPlace })
                } else if (action === "modify") {
                    allElementsChanges.push({ action, visualId, change: { place: key, changed: change }, parentId, newIndex, newPlace })
                } else if (action === "delete") {
                    allElementsChanges.push({ action, visualId, change: change[0], parentId, newIndex, newPlace })
                }
            } else if (typeof change === "object" && key === "attribs") {
                console.log("attribs", change)
                if (Object.keys(change).length < 2) {
                    let name = Object.keys(change)[0]
                    let newText = change[name]
                    console.log("name, ne", name, newText)
                    let newChange = []
                    if (newText.length === 1) newChange = ["", newText[0]]
                    if (newText.length === 2) newChange = newText
                    if (newText.length === 3) newChange = ["", newText[0]]
                    allElementsChanges.push({
                        action: "modify",
                        visualId,
                        change: { place: name, changed: newChange },
                        parentId,
                        newIndex,
                        newPlace: "attribs",
                    })
                } else {
                    let place = "attributeName"
                    let newChange = []
                    Object.entries(change).forEach(([name, newText]) => {
                        if (newText.length === 3 && newText[2] === 0) {
                            newChange[0] = name
                        } else {
                            newChange[1] = name
                        }
                    })
                    console.log("attribs", change)
                    console.log("attribs", place, newChange)

                    allElementsChanges.push({ action: "modify", visualId, change: { place, changed: newChange }, parentId, newIndex, newPlace: "attribs" })
                }
            } else {
                // Nested changes within properties like childNodes or attribsif  ()

                applyChangesFromDiff(change, allElements, allElementsChanges, parentId, visualId, newIndex, newPlace)
            }
        })

        return allElementsChanges
    }
    

   

    
    


    

    function determineAction(change) {
        if (change.length === 1) return "add"
        if (change.length === 2) return "modify"
        if (change.length === 3 && change[2] === 0) return "delete"
        return "unknown"
    }


    return (
        <div className="w-full">
            <div className=" ml-10 mt-10 w-auto">
                <Editor height="90vh" onChange={handleChange} onMount={handleEditorMount} value={text} defaultLanguage="html" theme="vs-dark" defaultValue="" />
            </div>
        </div>
    )
}
