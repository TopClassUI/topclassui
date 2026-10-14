// PLAN section 20: the server render must hydrate with no recoverable error, the holder's counter included.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Textarea } from '../index.js'

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrates the server HTML; returns that HTML, what React reported and the container, still mounted. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  const html = renderToString(element)
  container.innerHTML = html
  document.body.appendChild(container)
  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })
  return { html, errors, container }
}

describe('a server-rendered Textarea hydrates cleanly', () => {
  it('reports nothing for a plain textarea, which has no client part to hydrate', async () => {
    const { errors, container } = await hydrate(createElement(Textarea, { 'aria-label': 'Bio', defaultValue: 'Hi' }))
    expect(errors).toEqual([])
    expect(container.innerHTML).toMatch(/^<textarea /)
    container.remove()
  })

  it('reads 12 / 5,000 in the server HTML and after hydration, with showCount and a default of twelve characters', async () => {
    const { html, errors, container } = await hydrate(createElement(Textarea, { 'aria-label': 'Bio', showCount: true, defaultValue: 'Twelve chars' }))
    expect(html).toContain('>12 / 5,000</span>')
    expect(errors).toEqual([])
    expect(container.querySelector('[aria-hidden]')?.textContent).toBe('12 / 5,000')
    container.remove()
  })

  it('reports nothing for a holder past the threshold, with autosize alone', async () => {
    const { html, errors, container } = await hydrate(createElement(Textarea, { 'aria-label': 'Bio', autosize: true, maxLength: 10, defaultValue: 'Nine char' }))
    expect(html).toContain('>9 / 10</span>')
    expect(errors).toEqual([])
    container.remove()
  })

  it('reports nothing invalid, read-only or with a caller description', async () => {
    const { errors, container } = await hydrate(createElement(Textarea, { 'aria-label': 'Bio', invalid: true, readOnly: true, showCount: true, 'aria-describedby': 'hint' }))
    expect(errors).toEqual([])
    container.remove()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBe(10)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, container } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      container.remove()
    })
  }
})
