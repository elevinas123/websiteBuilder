class Node<T> {
    state: T
    parent: Node<T> | null
    children: Array<Node<T>>

    constructor(state: T, parent: Node<T> | null = null) {
        this.state = state // The state at this node
        this.parent = parent // Reference to the parent node
        this.children = [] // Child nodes
    }

    addChild(state: T): Node<T> {
        const childNode = new Node(state, this)
        this.children.push(childNode)
        return childNode
    }
}

class UndoTree<T> {
    root: Node<T>
    currentNode: Node<T>
    redoHistory: number[]

    constructor(initialState: T) {
        this.root = new Node(initialState)
        this.currentNode = this.root
        this.redoHistory = []
    }

    performAction(newState: T): void {
        this.redoHistory = []
        const newNode = this.currentNode.addChild(newState)
        this.currentNode = newNode
    }

    undo(): void {
        if (this.currentNode.parent) {
            this.redoHistory.push(this.currentNode.parent.children.indexOf(this.currentNode))
            this.currentNode = this.currentNode.parent
        }
    }

    redo(): void {
        if (this.redoHistory.length > 0 && this.currentNode.children.length > 0) {
            const branchIndex = this.redoHistory.pop()
            if (branchIndex !== undefined && branchIndex < this.currentNode.children.length) {
                this.currentNode = this.currentNode.children[branchIndex]
            }
        } else if (this.currentNode.children.length === 1) {
            this.currentNode = this.currentNode.children[0]
        }
    }
}

export default UndoTree
