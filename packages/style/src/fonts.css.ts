import { globalFontFace } from '@vanilla-extract/css'

globalFontFace('InstrumentSans', {
  src: 'url("./assets/fonts/InstrumentSans[wdth,wght].woff2") format("woff2-variations")',
  fontWeight: '100 900',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

globalFontFace('JetBrainsMono', {
  src: 'url("./assets/fonts/JetBrainsMono[wght].woff2") format("woff2-variations")',
  fontWeight: '100 800',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})
