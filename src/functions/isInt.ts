export default function isInt(value: unknown): boolean {
    if (typeof value === "string") {
        const number = Number(value)
        return !isNaN(number) && Number.isInteger(number)
    }
    return typeof value === "number" && Number.isInteger(value)
}
