import { ComponentPreview } from '../types'

import * as styles from './preview.css'

interface PreviewProps {
  preview: ComponentPreview | null
  selectedItem: string | null
  selectedType: 'variant' | 'demo' | null
}

export function Preview({ preview, selectedItem, selectedType }: PreviewProps) {
  if (!preview) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.noSelection}>
          Select a component from the sidebar to preview
        </div>
      </div>
    )
  }

  // If no selection, prompt user to select something
  if (!selectedItem || !selectedType) {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.noSelection}>
          Select a variant or demo to preview
        </div>
      </div>
    )
  }

  // Render based on selection type
  if (selectedType === 'demo' && preview.demos) {
    const currentDemo = preview.demos.find(d => d.name === selectedItem)
    if (currentDemo) {
      return (
        <div className={styles.previewContainer}>
          <div className={styles.previewPane}>{currentDemo.render()}</div>
        </div>
      )
    }
  } else if (selectedType === 'variant' && preview.variants) {
    const currentVariant = preview.variants.find(v => v.name === selectedItem)
    if (currentVariant) {
      const Component = preview.component
      return (
        <div className={styles.previewContainer}>
          <div className={styles.previewPane}>
            <Component {...currentVariant.props} />
          </div>
        </div>
      )
    }
  }

  // Fallback if nothing found
  return (
    <div className={styles.previewContainer}>
      <div className={styles.noSelection}>Preview not found</div>
    </div>
  )
}
