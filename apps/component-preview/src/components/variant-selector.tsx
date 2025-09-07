import { ComponentVariant } from '../types';
import * as styles from './variant-selector.css';

interface VariantSelectorProps {
  variants: ComponentVariant[];
  selectedVariant: string;
  onVariantSelect: (variantName: string) => void;
}

export function VariantSelector({ variants, selectedVariant, onVariantSelect }: VariantSelectorProps) {
  return (
    <div className={styles.variantSelector}>
      {variants.map((variant) => (
        <button
          key={variant.name}
          className={styles.variantButton}
          data-active={selectedVariant === variant.name}
          onClick={() => onVariantSelect(variant.name)}
        >
          {variant.name}
        </button>
      ))}
    </div>
  );
}