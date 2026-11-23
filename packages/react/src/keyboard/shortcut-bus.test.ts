import { afterEach, describe, expect, it, vi } from 'vitest'

import { registerShortcut } from './shortcut-bus'

const ID = 'schema-tree.toggle-field-types'

/** jsdom is not an Apple platform, so Mod is Control here. */
const toggleKeys = { key: 'l', ctrlKey: true, shiftKey: true }

const pressToggle = (init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    ...toggleKeys,
    bubbles: true,
    cancelable: true,
    ...init,
  })
  document.dispatchEvent(event)
  return event
}

const cleanups: (() => void)[] = []
const register = (handler: () => void, instance = 'a') => {
  const off = registerShortcut(instance, ID, handler)
  cleanups.push(off)
  return off
}

afterEach(() => {
  while (cleanups.length) cleanups.pop()?.()
  vi.restoreAllMocks()
})

describe('shortcut bus', () => {
  it('fires the registered handler and consumes the event', () => {
    const handler = vi.fn()
    register(handler)

    const event = pressToggle()

    expect(handler).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores keys that are not the combo', () => {
    const handler = vi.fn()
    register(handler)

    pressToggle({ key: 'k' })
    pressToggle({ shiftKey: false })

    expect(handler).not.toHaveBeenCalled()
  })

  /**
   * The failure this exists for: with a listener per component, two schema
   * trees on one page would each toggle the shared store, so an even number of
   * them does nothing at all and looks like a dead shortcut.
   */
  it('fires once when several bricks share an instance', () => {
    const first = vi.fn()
    const second = vi.fn()
    register(first)
    register(second)

    pressToggle()

    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  it('falls back to the earlier instance when the newest unmounts', () => {
    const first = vi.fn()
    const second = vi.fn()
    register(first)
    const offSecond = register(second)

    offSecond()
    pressToggle()

    expect(first).toHaveBeenCalledOnce()
  })

  // Something upstream already acted on this keypress.
  it('stands down when the event was already handled', () => {
    const handler = vi.fn()
    register(handler)

    document.addEventListener('keydown', event => event.preventDefault(), {
      capture: true,
      once: true,
    })
    pressToggle()

    expect(handler).not.toHaveBeenCalled()
  })

  it('ignores auto-repeat from a held key', () => {
    const handler = vi.fn()
    register(handler)

    pressToggle({ repeat: true })

    expect(handler).not.toHaveBeenCalled()
  })

  it('attaches listeners once and removes them with the last handler', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const types = (spy: typeof add) => spy.mock.calls.map(([type]) => type)
    const all = ['keydown', 'focusin', 'pointerdown']

    const offFirst = registerShortcut('a', ID, vi.fn())
    const offSecond = registerShortcut('b', ID, vi.fn())
    expect(types(add)).toEqual(all)

    offFirst()
    expect(remove).not.toHaveBeenCalled()

    offSecond()
    expect(types(remove)).toEqual(all)
  })
})

describe('instance routing', () => {
  const mount = (instance: string) => {
    const el = document.createElement('button')
    el.setAttribute('data-agi-instance', instance)
    document.body.append(el)
    cleanups.push(() => el.remove())
    return el
  }

  const pressOn = (target: Element) => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        ...toggleKeys,
        bubbles: true,
        cancelable: true,
      })
    )
  }

  it('routes to the instance containing the target', () => {
    const a = vi.fn()
    const b = vi.fn()
    register(a, 'a')
    register(b, 'b')

    pressOn(mount('a'))

    expect(a).toHaveBeenCalledOnce()
    expect(b).not.toHaveBeenCalled()
  })

  it('falls back to the instance last interacted with', () => {
    const a = vi.fn()
    const b = vi.fn()
    register(a, 'a')
    register(b, 'b')

    mount('a').dispatchEvent(new Event('pointerdown', { bubbles: true }))
    pressToggle()

    expect(a).toHaveBeenCalledOnce()
    expect(b).not.toHaveBeenCalled()
  })

  it('ignores a last-active element that has since unmounted', () => {
    const a = vi.fn()
    const b = vi.fn()
    register(a, 'a')
    register(b, 'b')

    const el = mount('a')
    el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    el.remove()
    pressToggle()

    expect(b).toHaveBeenCalledOnce()
    expect(a).not.toHaveBeenCalled()
  })

  it('never reaches another instance when the resolved one has no handler', () => {
    const b = vi.fn()
    register(b, 'b')

    pressOn(mount('a'))

    expect(b).not.toHaveBeenCalled()
  })
})
