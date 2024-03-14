import { GridInfo } from "../Types"
import { Border } from "./gridCRUD"
import isInt from "./isInt"

export interface TailwindMapping {
    [s: string]: string
}

// Mapping object from CSS properties in GridInfo to Tailwind class formats
const tailwindMapping: { [key: string]: string } = {
    itemWidth: "w",
    itemHeight: "h",
    backgroundColor: "bg",
    // Example mapping for borderColor, assuming you have a Tailwind plugin or custom classes for border colors
}
function generateBorderClass(border: Border) {
    const sides = ["Left", "Top", "Right", "Bottom"] as const // Use 'as const' to narrow down the type to specific literals
    const widthClasses: string[] = []
    const colorClasses: string[] = []

    // Define a helper function to safely access border properties
    function getBorderSide(side: (typeof sides)[number]) {
        return border[`border${side}` as keyof Border]
    }
    const allSameWidth = sides.every((side) => getBorderSide(side).borderWidth === getBorderSide("Left").borderWidth)
    const allSameColor = sides.every((side) => getBorderSide(side).borderColor === getBorderSide("Left").borderColor)

    if (allSameWidth) {
        // If all sides have the same width, use a generic border width class
        if (border.borderLeft.borderWidth > 0) {
            widthClasses.push(`border-${border.borderLeft.borderWidth}`)
        }
    } else {
        // Generate specific classes for each side's width
        sides.forEach((side) => {
            const { borderWidth } = border[`border${side}`]
            if (borderWidth > 0) {
                const sideShort = side.toLowerCase().substring(0, 1) // 'l', 't', 'r', 'b'
                widthClasses.push(`border-${sideShort}-${borderWidth}`)
            }
        })
    }

    if (allSameColor && border.borderLeft.borderColor !== "transparent") {
        // If all sides have the same color and it's not transparent, use a generic border color class
        colorClasses.push(`border-${border.borderLeft.borderColor}`)
    } else {
        // Generate specific classes for each side's color
        sides.forEach((side) => {
            const { borderColor } = border[`border${side}`]
            if (borderColor !== "transparent") {
                const sideShort = side.toLowerCase().substring(0, 1) // 'l', 't', 'r', 'b'
                colorClasses.push(`border-${sideShort}-color-${borderColor}`) // Assuming custom color classes
            }
        })
    }

    return [...widthClasses, ...colorClasses].join(" ")
}

// Function to convert GridInfo properties to Tailwind CSS classes
export const cssToTailwind = (elementInfo: GridInfo): string => {
    let cssClasses: string[] = Object.keys(elementInfo).reduce((acc: string[], key: string) => {
        // Ensure the key is actually a keyof GridInfo to satisfy TypeScript's type checking
        if (key === "border") {
            acc.push(generateBorderClass(elementInfo[key]))
        }
        if (key in tailwindMapping) {
            const tailwindKey = key as keyof GridInfo
            const mapping = tailwindMapping[key]
            let itemValue = elementInfo[tailwindKey]
            if (isInt(itemValue)) itemValue = Math.abs(parseFloat(itemValue))
            let value: string

            // Handle specific cases as needed, assuming simple case here
            value = `${mapping}-${itemValue}`

            acc.push(value)
        }
        return acc
    }, [])

    return cssClasses.join(" ")
}
