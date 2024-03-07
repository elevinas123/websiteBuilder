export default function isInt(value: any) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))
}
