import { colorValuesContract } from './theme-contract.css'

// Generate the alpha object programmatically (type-safe!)
function createAlphaUtility<T extends Record<string, string>>(contract: T) {
  return Object.fromEntries(
    Object.keys(contract).map(key => [
      key,
      (alpha: number) => `oklch(${contract[key as keyof T]} / ${alpha})`,
    ])
  ) as { [K in keyof T]: (alpha: number) => string }
}

export const alpha = createAlphaUtility(colorValuesContract)
