/**
 * navigator.clipboard is undefined on plain http and in a sandboxed iframe, so
 * an unguarded call throws on click. The DOM lib declares it as always present,
 * hence the narrower local view. A published brick should not take the page down
 * for a copy button.
 */
export const copyText = (text: string) => {
  const { clipboard } = navigator as { clipboard?: Clipboard }

  void clipboard?.writeText(text)
}
