import { style } from '@vanilla-extract/css';

export const previewContainer = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fafafa',
  minHeight: 0,
});

export const previewPane = style({
  flex: 1,
  padding: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  backgroundColor: 'white',
  backgroundImage: `
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
});

export const componentWrapper = style({
  backgroundColor: 'white',
  padding: '32px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

export const noSelection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#999',
  fontSize: '16px',
});