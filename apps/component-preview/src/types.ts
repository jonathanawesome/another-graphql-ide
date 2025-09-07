import { ComponentType } from 'react';

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
}

export interface ComponentPreview {
  title: string;
  component: ComponentType<any>;
  variants: ComponentVariant[];
  category?: string;
}

export interface PreviewModule {
  default: ComponentPreview;
}