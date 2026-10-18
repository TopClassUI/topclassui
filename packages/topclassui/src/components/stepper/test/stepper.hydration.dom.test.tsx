// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Stepper } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)

  // act from testing-library: the rtl demo mounts TopClassProvider, whose toast viewport schedules work.
  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })

  onError.mockRestore()
  container.remove()
  return errors
}

describe('a server-rendered Stepper hydrates cleanly', () => {
  it('reports nothing for the four statuses and Arabic-Indic digits', async () => {
    const items = [
      { id: 'a', title: 'A' }, { id: 'b', title: 'B', status: 'error' as const }, { id: 'c', title: 'C' }, { id: 'd', title: 'D' },
    ]
    expect(await hydrate(<Stepper items={items} value="c" locale="ar-u-nu-arab" />)).toEqual([])
  })

  it('reports nothing for block content in a title', async () => {
    const items = [{ id: 'a', title: <><p>One</p><p>Two</p></> }, { id: 'b', title: <ul><li>Item</li></ul> }]
    expect(await hydrate(<Stepper items={items} />)).toEqual([])
  })

  it('reports nothing for no steps', async () => {
    expect(await hydrate(<Stepper items={[]} />)).toEqual([])
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['arabic-digits', 'basic', 'custom-size', 'long-content', 'playground', 'rtl', 'sizes', 'states', 'statuses'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual([])
    })
  }
})
