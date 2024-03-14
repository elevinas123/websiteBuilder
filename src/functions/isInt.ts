export default function isNumber(value: unknown): boolean {
    if (typeof value === "string") {
        const number = Number(value)
        return !isNaN(number) // Removed the integer check
    }
    return typeof value === "number" // No need to check for integer
}
