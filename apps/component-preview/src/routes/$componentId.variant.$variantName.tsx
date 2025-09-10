import { createFileRoute } from '@tanstack/react-router'

import { Preview } from '../components/preview'
import { createPreviewLoader, usePreviewComponent } from '../utils/route-utils'

export const Route = createFileRoute('/$componentId/variant/$variantName')({
  loader: createPreviewLoader('variant'),
  component: VariantRoute,
})

function VariantRoute() {
  const { componentId, variantName } = Route.useParams()
  const preview = usePreviewComponent(componentId)

  return (
    <Preview
      preview={preview}
      selectedItem={variantName || null}
      selectedType="variant"
    />
  )
}
