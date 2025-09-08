import { style } from '@vanilla-extract/css'

export const previewContainer = style({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
})

export const previewPane = style({
  flex: 1,
  padding: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
})

export const noSelection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#999',
  fontSize: '16px',
})
