import * as htmlparser2 from "htmlparser2"

export interface Attribs {
    
}
export interface Ast {
    tagName: string
    attribs: { [key: string]: string }
    childNodes: Ast[]
    textContent: string
}

export const parseHTML = (html: string): Ast[] => {
    let root: Ast = { tagName: "root", childNodes: [], attribs: {}, textContent: "" }
    let currentParent = root
    const stack = [root] // Use to track open elements
    let errors = [] // Accumulate errors found during parsing

    const parser = new htmlparser2.Parser(
        {
            onopentag: (name, attribs) => {
                console.log("atributai", attribs)
                if ("div" in attribs) {
                    delete attribs["div"]
                }
                if ("<" in attribs) {
                    delete attribs["<"]
                }
                if (name[name.length - 1] === "<") {
                    name = name.slice(0, -1)
                }
                const newNode = { tagName: name, attribs: attribs, childNodes: [], textContent: "" }
                currentParent.childNodes.push(newNode)
                stack.push(newNode)
                currentParent = newNode
            },
            ontext: (text) => {
                if (text.trim()) {
                    currentParent.textContent += text.trim()
                }
            },
            onclosetag: (tagName) => {
                if (stack.length === 0) {
                    // Stack is empty but a closing tag was found
                    errors.push(`No open tag for closing tag </${tagName}>.`)
                    return
                }
                if (tagName[tagName.length - 1] === "<") {
                    tagName = tagName.slice(0, -1)
                }
                // Check if the current closing tag matches the last opened tag
                const lastOpenedTag = stack[stack.length - 1]
                if (lastOpenedTag.tagName !== tagName) {
                    // If the tags don't match, record an error
                    errors.push(`Mismatched tag: Expected </${lastOpenedTag.tagName}> but found </${tagName}>.`)
                } else {
                    // Tags match, pop the stack and update the current parent
                    stack.pop()
                    currentParent = stack[stack.length - 1]
                }
            },
        },
        { decodeEntities: true }
    )

    parser.write(html)
    parser.end()

    // After parsing, check if there are any unclosed tags left in the stack
    if (stack.length > 1) {
        // Ignoring the root element
        const unclosedTags = stack
            .slice(1)
            .map((node) => `<${node.tagName}>`)
            .join(", ")
        errors.push(`Unclosed tag(s): ${unclosedTags}.`)
    }

    if (errors.length > 0) {
        throw new Error(`HTML validation errors: ${errors.join(" ")}`)
    }

    return root.childNodes
}

export const serializeASTtoHTML = (nodes: Ast[], depth = 0) => {
    // Ensure nodes is always an array
    if (!Array.isArray(nodes)) {
        nodes = [nodes]
    }

    return nodes
        .map((node) => {
            let indent = "  ".repeat(depth) // Define indentation: 2 spaces per depth level
            let html = ""

            // Check if it's a textual content without a surrounding tag
            if (node.tagName === undefined) {
                return `${indent}${node.textContent}\n`
            }

            // Start the tag with indentation
            html += `${indent}<${node.tagName}`

            // Add attributes
            if (node.attribs && Object.keys(node.attribs).length > 0) {
                for (const [key, value] of Object.entries(node.attribs)) {
                    html += ` ${key}="${value}"`
                }
            }

            // Check for self-closing tags and no textContent
            if (isSelfClosing(node.tagName) && !node.textContent) {
                html += " />\n"
            } else {
                html += ">"
                // Add text content directly if present, without increasing depth
                if (node.textContent && node.textContent.trim() !== "") {
                    html += `${node.textContent}`
                }

                // Add children with increased depth if present
                if (node.childNodes && node.childNodes.length > 0) {
                    html += `\n` // Move to the next line before adding children
                    html += serializeASTtoHTML(node.childNodes, depth + 1) // Process each child with increased depth
                    html += `${indent}` // Indentation for closing tag of elements with children
                }

                // Close the tag, if not a self-closing tag
                if (!isSelfClosing(node.tagName)) {
                    html += `</${node.tagName}>\n`
                }
            }

            return html
        })
        .join("") // Combine the HTML strings of all nodes
}

function isSelfClosing(tagName: string) {
    const selfClosingTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
    return selfClosingTags.includes(tagName)
}
