/**
 * Whether `Mod` means Command rather than Control.
 *
 * A function rather than a module constant so tests can drive both branches by
 * passing the answer in, instead of reaching around a cached value. Sniffs the
 * user agent because `navigator.platform` is deprecated and `userAgentData` is
 * not in the DOM lib yet.
 */
export const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
