import { useAtom } from "jotai"
import { useEffect, useState, useCallback, useRef } from "react"
import { allElementsAtom, gridPixelSizeAtom, visualsUpdatedAtom } from "./atoms"
import { debounce, every, transform } from "lodash" // Assuming you are using lodash for debouncing
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react"
// eslint-disable-next-line no-undef
import { diff } from "jsondiffpatch"
import { v4 as uuidv4 } from "uuid"
import { createNewGrid } from "./functions/gridCRUD"
import calculateNewStyle from "./functions/calculateNewStyle"
import { parseHTML, serializeASTtoHTML } from "./parseHTML"
import _ from "lodash"
import {produce} from "immer"
export default function MarkdownScreen() {
    const [text, setText] = useState("")
    const [allElements, setAllElements] = useAtom(allElementsAtom)
    const [gridPixelsize, setGridPixelSize] = useAtom(gridPixelSizeAtom)
    const [visualsUpdate, setVisualsUpdated] = useAtom(visualsUpdatedAtom)
    const [previousAst, setPreviousAst] = useState(parseHTML("<div></div>"))
    const mainId = "main-webGrid"
    const editorRef = useRef(null)

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
        }, 3000),
        []
    ) // 300ms debounce time, adjust as needed

    useEffect(() => {
        // Call the debounced function within useEffect
        console.log("tryuing to debounce")
        debouncedUpdateTheEditor(visualsUpdate, previousAst, allElements, setPreviousAst, setText)
    }, [visualsUpdate])

    const updateAst = (path, ast, amountOfElements) => {
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
    const createPathToElement = (id, allElements) => {
        let currId = id
        let path = []
        while (currId !== "main-webGrid") {
            let parentId = allElements[currId].parent
            if (!parent) console.error("wtf negalima tokio", currId, parentId)
            path.unshift(allElements[parentId].children.indexOf(currId))
            currId = parentId
        }
        return path
    }
    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor
    }

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

    function applyChangesFromDiff(
        diff,
        allElements,
        allElementsChanges = [],
        parentId = "main-webGrid",
        visualId = "main-webGrid",
        index = 0,
        place = "tagName"
    ) {
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
                    parentId !== null ? (allElements[parentId].children[newIndex] ? allElements[parentId].children[newIndex] : undefined) : "main-webGrid"
            }
            // Adjust the handling based on your structure. Assuming 'attribs' for attributes
            if (key === "attribs") newPlace = "attribs"
            if (key === "tagName") newPlace = "tagName"
            console.log("parentId", parentId)
            console.log("visualId", visualId)
            console.log("visualId")
            console.log("visualId", allElements[parentId])
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

    function addElementRecursively(change, parentId, draft, offsetLeft = 1, offsetTop = 1) {
        const newElementId = uuidv4()
        const styles = processStyles(change.attribs)
        const { text, childrenIds, totalHeight } = processChildNodes(change.childNodes || [], newElementId, draft, offsetTop)

        draft[newElementId] = createNewGrid(
            newElementId,
            parentId,
            offsetLeft,
            totalHeight,
            10, // elementWidth,
            10, // elementHeight,
            { top: 0, left: 0, bottom: 0, right: 0 },
            gridPixelsize,
            childrenIds
        )

        return [draft, newElementId, 10 /* elementWidth */, 10 /* elementHeight */]
    }


    function handleElementAddition(changeDetails, parentId, allElements, draft) {
        let elementsIds = []
        let totalHeight = calculateStartingHeight(parentId, 0, allElements) + 1 // +1 to start from the next possible height

        // Directly use `addElementRecursively` to modify the draft
        const [, childId, , h] = addElementRecursively(changeDetails, parentId, draft, 1, totalHeight)
        elementsIds.push(childId)
        totalHeight += h
        draft[parentId].children.push(childId)

        return { draft, elementsIds, totalHeight } // Return draft for clarity, even though it's modified in place
    }
    const deepCopyElement = (elements) => {
        let newElements = {}
        Object.entries(elements).forEach(([key, value]) => {
            // Since children are just strings, this does effectively deep copy them
            newElements[key] = { ...value, children: [...value.children] }
        })
        return newElements // Make sure to return the newElements object
    }

    function updateAllElements(changes, allElements, setAllElements) {
        setAllElements(produce(allElements, draft => {
            changes.forEach(({ action, visualId, change: changeDetails, parentId, newPlace }) => {
                if (action === "add" && changeDetails.nodeType !== 3) {
                    // Adjusted to use draft directly
                    handleElementAddition(changeDetails, parentId, draft, draft);
                } else if (action === "modify") {
                    handleElementModify(changeDetails, visualId, draft)
                } else if (action === "delete" && newPlace === "tagName") {
                    const parentElement = draft[parentId]
                    if (parentElement && parentElement.children) {
                        const index = parentElement.children.findIndex((childId) => childId === visualId)
                        if (index !== -1) {
                            // Directly mutate the draft's children array to remove the element
                            parentElement.children.splice(index, 1)
                        }
                    }
                } else {
                    console.warn("Unknown action type or unsupported change detected:", action)
                }
            })
        
        }))
    }
    const handleElementModify = (changeDetails, id, draft) => {
        const element = draft[id]
        if (!element) return // Early return if the element doesn't exist

        if (changeDetails.place === "classname") {
            const cssClasses = tailwindClassToCSS(changeDetails.changed[1])
            element.width = cssClasses.width || element.width
            element.height = cssClasses.height || element.height
            element.backgroundColor = cssClasses.bg || element.backgroundColor

            // Apply new styles calculated based on potential changes
            const newStyles = calculateNewStyle(element.left, element.top, element.width, element.height, gridPixelSizeAtom, element.backgroundColor)
            element.style = { ...element.style, ...newStyles }
        } else if (changeDetails.place === "text") {
            element.text = changeDetails.changed[1]
        } else if (changeDetails.place === "tagName") {
            //I will add tag functionality later
            return 
        }

        return 
    }
    function tailwindClassToCSS(classNames) {
        const unitToPx = (unit) => `${unit * 4}px` // Ensure the unit is a string with px for CSS

        const colorMappings = {
            "red-500": "#f56565", // Example color mapping
            // Additional color mappings as needed
        }

        const regex = /^([a-z]+(?:-[a-z]+)*?)-(\d+|[a-z]+\-\d+)$/
        let styles = {}

        classNames.split(" ").forEach((className) => {
            const match = className.match(regex)
            if (!match) return

            const [, type, value] = match

            if (type.startsWith("bg") && colorMappings[value]) {
                styles["backgroundColor"] = colorMappings[value]
                return
            }

            // Numeric values handling
            if (!isNaN(value)) {
                const cssValue = unitToPx(parseInt(value))
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
