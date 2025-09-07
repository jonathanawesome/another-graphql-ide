import { style } from '@vanilla-extract/css';

export const variantSelector = style({
  display: 'flex',
  gap: '8px',
  padding: '16px',
  backgroundColor: '#f9f9f9',
  borderTop: '1px solid #e5e5e5',
  flexWrap: 'wrap',
});

export const variantButton = style({
  padding: '6px 12px',
  border: '1px solid #e5e5e5',
  backgroundColor: 'white',
  borderRadius: '4px',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  
  ':hover': {
    backgroundColor: '#f0f0f0',
    borderColor: '#3b82f6',
  },
  
  selectors: {
    '&[data-active="true"]': {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6',
    },
  },
});