// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, createElement, type ComponentType } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Meter } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. */
async function hydrate(element: Parameters<typeof renderToString>[0]) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)

  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })

  onError.mockRestore()
  container.remove()
  return errors
}

describe('a server-rendered Meter hydrates cleanly', () => {
  it('reports nothing for a plain meter, whose style carries the custom property', async () => {
    expect(await hydrate(createElement(Meter, { 'aria-label': 'Battery', value: 40 }))).toEqual([])
  })

  it('reports nothing when the caller style sits beside the variable', async () => {
    const props = { 'aria-label': 'Battery', value: 40, style: { opacity: 0.5 } }
    expect(await hydrate(createElement(Meter, props))).toEqual([])
  })

  it('reports nothing for a clamped value and a raised max', async () => {
    expect(await hydrate(createElement(Meter, { 'aria-label': 'Battery', value: 150, min: 10, max: 5 }))).toEqual([])
  })

  it('reports nothing for a fraction of a percent, which prints the same on both sides', async () => {
    expect(await hydrate(createElement(Meter, { 'aria-label': 'Battery', value: 1, max: 3 }))).toEqual([])
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'custom-size', 'range', 'rtl', 'sizes', 'tones'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual([])
    })
  }
})
