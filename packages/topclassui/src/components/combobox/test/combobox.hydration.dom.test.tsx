// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Combobox } from '../index.js'

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

const ITEMS = [{ value: 'next', label: 'Next.js' }, { value: 'astro', label: 'Astro' }]
const input = (container: HTMLElement) => container.querySelector('[role="combobox"]') as HTMLInputElement

describe('a server-rendered Combobox hydrates cleanly', () => {
  it('the label of the default is in the server HTML, and the same after hydration, with the value in the hidden input', async () => {
    const element = createElement(Combobox, { 'aria-label': 'Framework', name: 'framework', items: ITEMS, defaultValue: 'astro' })
    const { errors, before, container, done } = await hydrate(element)
    expect(before).toContain('value="Astro"')
    expect(errors).toEqual([])
    expect(input(container).value).toBe('Astro')
    expect(container.querySelector<HTMLInputElement>('input[name="framework"]')?.value).toBe('astro')
    done()
  })

  it('named by a label, neither the server HTML nor the closed input once hydrated carries an aria-label: the label names it', async () => {
    const element = createElement('div', null,
      createElement('label', { htmlFor: 'fw' }, 'Framework'),
      createElement(Combobox, { id: 'fw', items: ITEMS }))
    const { errors, before, container, done } = await hydrate(element)
    expect(before).not.toContain('aria-label')
    expect(errors).toEqual([])
    expect(input(container).hasAttribute('aria-label')).toBe(false)
    done()
  })

  it('a caller\'s aria-labelledby is kept, and nothing is copied over it', async () => {
    const element = createElement('div', null,
      createElement('label', { htmlFor: 'fw', id: 'fw-label' }, 'Framework'),
      createElement(Combobox, { id: 'fw', 'aria-labelledby': 'fw-label', items: ITEMS }))
    const { container, done } = await hydrate(element)
    expect(input(container).getAttribute('aria-labelledby')).toBe('fw-label')
    expect(input(container).hasAttribute('aria-label')).toBe(false)
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'load-more', 'long-content', 'playground', 'rtl', 'sizes', 'state-matrix', 'states', 'status', 'ten-thousand'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
