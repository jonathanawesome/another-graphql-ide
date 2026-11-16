import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  createTestStore,
  renderWithProvider,
} from '../../../../test-utils/render-with-provider'

import { SettingsContent } from './settings-content'

describe('SettingsContent', () => {
  it('toggles return types from the checkbox', () => {
    const { store } = renderWithProvider(<SettingsContent />)

    fireEvent.click(
      screen.getByRole('checkbox', { name: /show return types/i })
    )

    expect(store.getState().showFieldTypes).toBe(true)
  })

  it('reflects the setting when it was changed elsewhere', () => {
    renderWithProvider(<SettingsContent />, {
      store: createTestStore({ showFieldTypes: true }),
    })

    expect(
      screen.getByRole('checkbox', { name: /show return types/i })
    ).toHaveProperty('ariaChecked', 'true')
  })

  /**
   * The panel is where someone looks for a behavior, so it is where they should
   * learn the faster way to reach it. The keys come from the shortcut registry,
   * so this cannot advertise a binding that does not fire. jsdom is not an
   * Apple platform, hence Control rather than Command.
   */
  it('hides insertion settings for a browse-only tree', () => {
    renderWithProvider(<SettingsContent showInsertion={false} />)

    expect(screen.queryByText('Object field insertion')).toBeNull()
    expect(screen.getByText('Show return types')).toBeDefined()
  })

  it('advertises the keyboard shortcut beside the setting', () => {
    renderWithProvider(<SettingsContent />)

    expect(screen.getByText('Control Shift L')).toBeDefined()
  })
})
