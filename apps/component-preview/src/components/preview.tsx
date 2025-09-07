import { ComponentPreview } from '../types';
import { VariantSelector } from './variant-selector';
import * as styles from './preview.css';

interface PreviewProps {
  preview: ComponentPreview | null;
  selectedVariant: string | null;
  onVariantSelect: (variantName: string) => void;
}

export function Preview({ preview, selectedVariant, onVariantSelect }: PreviewProps) {
  if (!preview) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.noSelection}>
          Select a component from the sidebar to preview
        </div>
      </div>
    );
  }

  const currentVariant = selectedVariant 
    ? preview.variants.find(v => v.name === selectedVariant) || preview.variants[0]
    : preview.variants[0];
    
  const Component = preview.component;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewPane}>
        <div className={styles.componentWrapper}>
          <Component {...currentVariant.props} />
        </div>
      </div>
      {preview.variants.length > 1 && (
        <VariantSelector
          variants={preview.variants}
          selectedVariant={selectedVariant || preview.variants[0].name}
          onVariantSelect={onVariantSelect}
        />
      )}
    </div>
  );
}