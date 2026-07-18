import { createFileRoute } from '@tanstack/react-router'

import { Preview } from '../components/preview'

export const Route = createFileRoute('/')({
  component: IndexRoute,
})

function IndexRoute() {
  return <Preview preview={null} selectedItem={null} selectedType={null} />
}
