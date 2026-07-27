import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { RunControl } from './run-control'

export const nav: NavPath = 'UI Components/Run Control'

const noop = () => undefined

export const Examples = createPreview(() => (
  <DemoGrid>
    <DemoGridItem>
      <RunControl status="idle" onRun={noop} />
    </DemoGridItem>
    <DemoGridItem>
      <RunControl status="idle" onRun={noop} text="ExampleQuery" />
    </DemoGridItem>
    <DemoGridItem>
      <RunControl status="fetching" onRun={noop} onCancel={noop} />
    </DemoGridItem>
    <DemoGridItem>
      <RunControl status="streaming" onRun={noop} onCancel={noop} />
    </DemoGridItem>
    <DemoGridItem>
      <RunControl status="error" onRun={noop} error="Failed to fetch" />
    </DemoGridItem>
  </DemoGrid>
))
