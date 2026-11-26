const MIN_DELAY = 150
const MAX_DELAY = 1500

/**
 * Waits longer where checks are slow, so typing is not held up by them. Kept
 * apart from diagnostics.ts so indexing code can use it without the theme.
 */
export const checkDelay = (cost: number) =>
  Math.min(Math.max(cost * 3, MIN_DELAY), MAX_DELAY)
