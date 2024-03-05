import * as htmlparser2 from "htmlparser2";


export const parseHTML = (html) => {
    let root = { tagName: "root", childNodes: [] }
    let currentParent = root
    const stack = [root] // Use to track open elements
    let errors = [] // Accumulate errors found during parsing

    const parser = new htmlparser2.Parser(
        {
            onopentag: (name, attribs) => {
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