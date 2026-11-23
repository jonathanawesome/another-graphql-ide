const kebab = (segment: string) =>
  segment.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

/** `['fill', 'accentSoft']` -> `-fill-accent-soft` */
export function arrayToKebabString(arr: string[]): string {
  return `-${arr.map(kebab).join('-')}`
}

export const transformColors = <T extends Record<string, string>>(
  colorTheme: T
) => {
  return Object.fromEntries(
    Object.entries(colorTheme).map(([key, value]) => [key, `oklch(${value})`])
  ) as { [K in keyof T]: string }
}
