// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Switch } from '../index.js'

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

describe('a server-rendered Switch hydrates cleanly', () => {
  it('the default is in the server HTML before hydration, and is the same after it', async () => {
    const { errors, before, container, done } = await hydrate(createElement(Switch, { 'aria-label': 'A', name: 'a', defaultChecked: true }))
    expect(before).toContain('aria-checked="true"')
    expect(before).toMatch(/<input [^>]*checked=""/)
    expect(errors).toEqual([])
    expect(container.querySelector('button')?.getAttribute('aria-checked')).toBe('true')
    expect((container.querySelector('input') as HTMLInputElement).checked).toBe(true)
    done()
  })

  it('a press after hydration toggles it', async () => {
    const { container, done } = await hydrate(createElement(Switch, { 'aria-label': 'A' }))
    act(() => { container.querySelector('button')?.click() })
    expect(container.querySelector('button')?.getAttribute('aria-checked')).toBe('true')
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'combined', 'form', 'playground', 'rtl', 'sizes', 'stage', 'states', 'unchecked-value'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
