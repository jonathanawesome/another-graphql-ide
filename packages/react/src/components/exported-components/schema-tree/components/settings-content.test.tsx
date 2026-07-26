import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

const { useAppStore } = await import('../../../../state')
const { SettingsContent } = await import('./settings-content')

describe('SettingsContent', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('toggles return types from the checkbox', () => {
    render(<SettingsContent />)

    fireEvent.click(
      screen.getByRole('checkbox', { name: /show return types/i })
    )

    expect(useAppStore.getState().showFieldTypes).toBe(true)
  })

  it('reflects the setting when it was changed elsewhere', () => {
    useAppStore.setState({ showFieldTypes: true })
    render(<SettingsContent />)

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
  it('advertises the keyboard shortcut beside the setting', () => {
    render(<SettingsContent />)

    expect(screen.getByText('Control Shift L')).toBeDefined()
  })
})
