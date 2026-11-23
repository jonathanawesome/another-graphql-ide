const kebab = (segment: string) =>
  segment.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export function arrayToKebabString(arr: string[]): string {
  return `-${arr.map(kebab).join('-')}`
}
