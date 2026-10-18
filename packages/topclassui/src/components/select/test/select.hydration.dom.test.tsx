// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Select } from '../index.js'

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

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }]
const country = (defaultValue?: string) => createElement(Select, {
  'aria-label': 'Country', name: 'country', items: ITEMS, ...(defaultValue === undefined ? {} : { defaultValue }),
})

describe('a server-rendered Select hydrates cleanly', () => {
  it('the label of the default is in the server HTML, and the same after hydration, with the value in the input', async () => {
    const { errors, before, container, done } = await hydrate(country('eg'))
    expect(before).toContain('>Egypt</span>')
    expect(errors).toEqual([])
    expect(container.querySelector('[role="combobox"]')?.textContent).toBe('Egypt')
    expect(container.querySelector('input')?.value).toBe('eg')
    done()
  })

  it('the placeholder, with nothing chosen, is the same before and after', async () => {
    const { errors, before, container, done } = await hydrate(country())
    expect(before).toContain('>Select</span>')
    expect(errors).toEqual([])
    expect(container.querySelector('[role="combobox"]')?.textContent).toBe('Select')
    done()
  })

  it('the trigger is the one tab stop before hydration and after it', async () => {
    const { before, container, done } = await hydrate(country('jo'))
    expect(before.match(/tabindex="0"/g)).toHaveLength(1)
    expect(container.querySelector('[role="combobox"]')?.getAttribute('tabindex')).toBe('0')
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'four-rows', 'long-content', 'phase-4-form', 'playground', 'rtl', 'sixty-items', 'sizes', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
