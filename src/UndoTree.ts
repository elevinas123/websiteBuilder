class Node {
    constructor(state, parent = null) {
        this.state = state // The state at this node
        this.parent = parent // Reference to the parent node
        this.children = [] // Child nodes
    }

    addChild(state) {
        const childNode = new Node(state, this)
        this.children.push(childNode)
        return childNode
    }
}


class UndoTree {
    constructor(initialState) {
        this.root = new Node(initialState)
        this.currentNode = this.root
        // New addition: Keep a history of indices for redo operations after undo
        this.redoHistory = []
    }

    performAction(newState) {
        // Whenever a new action is performed, clear redo history
        // because it's a new branch of actions
        this.redoHistory = []
        const newNode = this.currentNode.addChild(newState)
        this.currentNode = newNode
    }

    undo() {
        if (this.currentNode.parent) {
            // When undoing, add the index of the current node to redoHistory
            // so we know which branch to follow when redoing
            this.redoHistory.push(this.currentNode.parent.children.indexOf(this.currentNode))
            this.currentNode = this.currentNode.parent
        }
    }

    redo() {
        if (this.redoHistory.length > 0 && this.currentNode.children.length > 0) {
            // Use the last index in redoHistory to determine which branch to follow
            const branchIndex = this.redoHistory.pop()
            if (branchIndex < this.currentNode.children.length) {
                this.currentNode = this.currentNode.children[branchIndex]
            }
        } else if (this.currentNode.children.length === 1) {
            // If there's only one branch and no history, just follow it
            this.currentNode = this.currentNode.children[0]
        }
        // If there are multiple branches but no history (e.g., first redo), do nothing or implement a default behavior
    }
}


export default UndoTree
