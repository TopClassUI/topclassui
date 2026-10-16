// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RadioGroupItem, RadioGroupRoot } from '../index.js'
import { useChromiumLabels } from './chromium-labels.js'

useChromiumLabels()

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch, and the container it left. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)
  const before = container.innerHTML
  const root = await act(() => Promise.resolve(hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })))
  onError.mockRestore()
  return { errors, before, container, done: () => { act(() => { root.unmount() }); container.remove() } }
}

const group = (defaultValue?: string) => createElement(
  RadioGroupRoot,
  { 'aria-label': 'Plan', name: 'plan', ...(defaultValue === undefined ? {} : { defaultValue }) },
  createElement(RadioGroupItem, { value: 'free' }, 'Free'),
  createElement(RadioGroupItem, { value: 'pro' }, 'Pro'),
  createElement(RadioGroupItem, { value: 'team' }, 'Team'),
)
const tabStops = (container: HTMLElement) => [...container.querySelectorAll('button')].map((button) => button.getAttribute('tabindex'))

describe('a server-rendered RadioGroup hydrates cleanly', () => {
  it('the default is in the server HTML before hydration, and is the same after it', async () => {
    const { errors, before, container, done } = await hydrate(group('pro'))
    expect(before.match(/aria-checked="true"/g)).toHaveLength(1)
    expect(errors).toEqual([])
    expect([...container.querySelectorAll('button')].map((button) => button.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect([...container.querySelectorAll('input')].map((input) => input.checked)).toEqual([false, true, false])
    done()
  })

  it('the one tab stop is the server\'s before hydration and Base UI\'s after it, on the same radio', async () => {
    const { before, container, done } = await hydrate(group('pro'))
    expect(before.match(/tabindex="0"/g)).toHaveLength(1)
    expect(tabStops(container)).toEqual(['-1', '0', '-1'])
    done()
  })

  // SHARED-FORMS-4: with none checked, or a default no radio has, the server HTML had no tab stop at all.
  for (const [what, defaultValue] of [['no default', undefined], ['a default no radio has', 'stale']] as const) {
    it(`a group with ${what} serves its tab stop on the first radio, where Base UI keeps it once it hydrates`, async () => {
      const { errors, before, container, done } = await hydrate(group(defaultValue))
      expect(errors).toEqual([])
      expect(before.match(/<button [^>]*>/g)?.map((button) => /tabindex="(-?\d)"/.exec(button)?.[1])).toEqual(['0', '-1', '-1'])
      expect(tabStops(container)).toEqual(['0', '-1', '-1'])
      done()
    })
  }

  it('a first radio that is disabled passes the stop to the next, before and after hydration', async () => {
    const element = createElement(
      RadioGroupRoot,
      { 'aria-label': 'Plan', name: 'plan' },
      createElement(RadioGroupItem, { value: 'free', disabled: true }, 'Free'),
      createElement(RadioGroupItem, { value: 'pro' }, 'Pro'),
    )
    const { errors, before, container, done } = await hydrate(element)
    expect(errors).toEqual([])
    expect(before.match(/<button [^>]*>/g)?.map((button) => /tabindex="(-?\d)"/.exec(button)?.[1])).toEqual(['-1', '0'])
    expect(tabStops(container)).toEqual(['-1', '0'])
    done()
  })

  it('a press after hydration selects', async () => {
    const { container, done } = await hydrate(group('pro'))
    act(() => { container.querySelectorAll('button')[2]?.click() })
    expect(container.querySelectorAll('button')[2]?.getAttribute('aria-checked')).toBe('true')
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'horizontal', 'long-content', 'rtl', 'sizes', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
