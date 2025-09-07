import { style } from '@vanilla-extract/css';

export const sidebar = style({
  width: '280px',
  backgroundColor: '#fff',
  borderRight: '1px solid #e5e5e5',
  padding: '16px',
  overflowY: 'auto',
});

export const title = style({
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '24px',
  color: '#1a1a1a',
});

export const category = style({
  marginBottom: '16px',
});

export const categoryTitle = style({
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '#666',
  marginBottom: '8px',
  letterSpacing: '0.5px',
});

export const componentList = style({
  listStyle: 'none',
});

export const componentItem = style({
  marginBottom: '4px',
});

export const componentButton = style({
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#1a1a1a',
  cursor: 'pointer',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'background-color 0.2s',
  
  ':hover': {
    backgroundColor: '#f0f0f0',
  },
  
  selectors: {
    '&[data-active="true"]': {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
  },
});

export const variantList = style({
  marginLeft: '12px',
  marginTop: '4px',
});

export const variantButton = style({
  display: 'block',
  width: '100%',
  padding: '6px 12px',
  textAlign: 'left',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#666',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '13px',
  transition: 'background-color 0.2s',
  
  ':hover': {
    backgroundColor: '#f0f0f0',
    color: '#1a1a1a',
  },
  
  selectors: {
    '&[data-active="true"]': {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
    },
  },
});