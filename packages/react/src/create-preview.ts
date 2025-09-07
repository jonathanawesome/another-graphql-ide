import { ComponentType } from 'react';

export interface TypedComponentPreview<TProps> {
  title: string;
  component: ComponentType<TProps>;
  category?: string;
  variants: Array<{
    name: string;
    props: TProps;
  }>;
}

/**
 * Creates a fully type-safe component preview.
 * The props in variants are automatically validated against the component's prop types.
 */
export function createPreview<TProps>(
  config: TypedComponentPreview<TProps>
): TypedComponentPreview<TProps> {
  return config;
}