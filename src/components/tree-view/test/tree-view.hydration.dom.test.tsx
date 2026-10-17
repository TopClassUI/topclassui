// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TreeView } from '../index.js'

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

const ITEMS = [{ id: 'a', label: 'A', children: [{ id: 'b', label: 'B' }] }, { id: 'c', label: 'C' }]

describe('a server-rendered TreeView hydrates cleanly', () => {
  it('the row ids the server wrote are the ids after hydration, so aria-activedescendant names a real row', async () => {
    const { errors, before, container, done } = await hydrate(createElement(TreeView, { 'aria-label': 'T', items: ITEMS, defaultExpanded: ['a'] }))
    expect(errors).toEqual([])
    const after = [...container.querySelectorAll('[role="treeitem"]')].map((row) => row.id)
    expect(after).toHaveLength(3)
    expect(new Set(after).size).toBe(3)
    for (const id of after) expect(before).toContain(`id="${id}"`)
    act(() => { container.querySelector<HTMLElement>('[role="tree"]')?.focus() })
    expect(container.querySelector('[role="tree"]')?.getAttribute('aria-activedescendant')).toBe(after[0])
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'load-more', 'long-content', 'rtl', 'selected', 'skeleton', 'status', 'ten-thousand'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
