import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Popover } from './popover'

const trigger = <button>Open</button>

describe('Popover', () => {
  it('stays closed by default', () => {
    render(<Popover content={<p>panel</p>} trigger={trigger} />)

    expect(screen.queryByText('panel')).toBeNull()
  })

  // No interaction on purpose: forwarding only defaultOpen would still pass an
  // uncontrolled test while leaving a controlled popover unable to open.
  it('renders open content when controlled open', () => {
    render(<Popover open content={<p>panel</p>} trigger={trigger} />)

    expect(screen.getByText('panel')).toBeDefined()
  })

  it('opens from defaultOpen', () => {
    render(<Popover defaultOpen content={<p>panel</p>} trigger={trigger} />)

    expect(screen.getByText('panel')).toBeDefined()
  })

  it('reports closing through onOpenChange', () => {
    const onOpenChange = vi.fn()
    render(
      <Popover
        open
        onOpenChange={onOpenChange}
        content={<p>panel</p>}
        trigger={trigger}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false)
  })

  // The close button used to be labelled for the schema tree specifically.
  it('labels the close button generically', () => {
    render(<Popover open content={<p>panel</p>} trigger={trigger} />)

    expect(
      screen.queryByRole('button', { name: /schema view tree/i })
    ).toBeNull()
  })
})
