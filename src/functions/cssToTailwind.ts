import { GridInfo } from "../Types"

export interface TailwindMapping {
    [s: string]: string
}



// Mapping object from CSS properties in GridInfo to Tailwind class formats
const tailwindMapping: { [key: string]: string } = {
  width: 'w',
  height: 'h',
  // Example mapping for borderColor, assuming you have a Tailwind plugin or custom classes for border colors
};

// Function to convert GridInfo properties to Tailwind CSS classes
function convertInfoToTailwindClasses(elementInfo: GridInfo): string {
  let cssClasses: string[] = Object.keys(elementInfo).reduce((acc: string[], key: string) => {
    const mapping = tailwindMapping[key];
    if (mapping) {
      let value: string = `${mapping}-${elementInfo[key]}`;
      
      acc.push(value);
    }
    return acc;
  }, []);

  return cssClasses.join(' ');
}