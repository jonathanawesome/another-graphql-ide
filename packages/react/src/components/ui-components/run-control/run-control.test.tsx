import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RunControl } from './run-control'

describe('RunControl', () => {
  it('runs when idle', () => {
    const onRun = vi.fn()
    render(<RunControl status="idle" onRun={onRun} />)

    fireEvent.click(screen.getByRole('button', { name: 'Execute operation' }))

    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('uses the given text when idle', () => {
    render(<RunControl status="idle" onRun={vi.fn()} text="ExampleQuery" />)

    expect(screen.getByText('ExampleQuery')).toBeDefined()
  })

  it.each(['fetching', 'streaming'] as const)(
    'offers stop while %s',
    status => {
      const onCancel = vi.fn()
      render(<RunControl status={status} onRun={vi.fn()} onCancel={onCancel} />)

      expect(
        screen.queryByRole('button', { name: 'Execute operation' })
      ).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Stop operation' }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    }
  )

  // Asserted on the alert rather than a tooltip, which only mounts on hover and
  // would leave this untestable.
  it('surfaces the error message', () => {
    render(
      <RunControl status="error" onRun={vi.fn()} error="Failed to fetch" />
    )

    expect(screen.getByRole('alert').textContent).toBe('Failed to fetch')
    expect(
      screen.getByRole('button', { name: 'Execute operation' })
    ).toBeDefined()
  })

  it('shows no alert without an error', () => {
    render(<RunControl status="idle" onRun={vi.fn()} />)

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
