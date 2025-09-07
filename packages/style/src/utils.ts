export function arrayToKebabString(arr: string[]): string {
  return `-${arr.join('-')}`
}
