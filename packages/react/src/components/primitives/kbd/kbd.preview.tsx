import { createPreview, type NavPath } from 'react-foundry'

import { shortcutEntries } from '../../../keyboard'
import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Kbd } from './kbd'

export const nav: NavPath = 'Primitives/Kbd'

export const Examples = createPreview(() => (
  <DemoGrid>
    <DemoGridItem>
      <Kbd shortcut="schema-tree.toggle-field-types" />
    </DemoGridItem>
    <DemoGridItem>
      <Kbd keys={['Mod', 'Enter']} />
    </DemoGridItem>
    <DemoGridItem>
      <Kbd keys={['Escape']} />
    </DemoGridItem>
  </DemoGrid>
))

// Glyphs follow the platform, so this reads ⌘⇧L on a Mac and Ctrl Shift L
// everywhere else.
export const Inverted = createPreview({
  label: 'On a dark surface',
  render: () => (
    <div
      style={{
        background: '#111',
        borderRadius: 6,
        display: 'inline-flex',
        gap: 12,
        padding: 12,
      }}
    >
      <Kbd shortcut="schema-tree.toggle-field-types" tone="inverted" />
      <Kbd keys={['Mod', 'Enter']} tone="inverted" />
    </div>
  ),
})

/**
 * Driven entirely by the shortcut registry, so a new shortcut shows up here
 * without touching this file. This is the shape a keyboard help panel wants.
 */
export const AllShortcuts = createPreview({
  label: 'Every registered shortcut',
  render: () => (
    <table style={{ borderSpacing: '16px 6px' }}>
      <tbody>
        {shortcutEntries().map(([id, shortcut]) => (
          <tr key={id}>
            <td style={{ opacity: 0.6 }}>{shortcut.group}</td>
            <td>{shortcut.label}</td>
            <td>
              <Kbd shortcut={id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
})
