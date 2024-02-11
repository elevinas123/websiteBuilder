export default function getBoundingBox(ref) {
    //console.log(ref)
    if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        // rect contains properties: top, right, bottom, left, width, height
        return rect
    }
    return false
}
