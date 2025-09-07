import { style } from '@vanilla-extract/css';

export const layout = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const header = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '8px 16px',
  borderBottom: '1px solid #e2e2e2',
});

export const content = style({
  display: 'flex',
  flex: 1,
  minHeight: 0,
});

export const mainContent = style({
  flex: 1,
  display: 'flex',
  minWidth: 0,
});