import { createFileRoute } from '@tanstack/react-router'

import { Preview } from '../components/preview'
import { createPreviewLoader, usePreviewComponent } from '../utils/route-utils'

export const Route = createFileRoute('/$componentId/demo/$demoName')({
  loader: createPreviewLoader('demo'),
  component: DemoRoute,
})

function DemoRoute() {
  const { componentId, demoName } = Route.useParams()
  const preview = usePreviewComponent(componentId)

  return (
    <Preview
      preview={preview}
      selectedItem={demoName || null}
      selectedType="demo"
    />
  )
}
