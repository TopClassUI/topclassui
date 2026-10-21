// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField } from '../index.js'

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

const field = (defaultValue?: string) => createElement(OTPField, { id: 'code', name: 'code', length: 4, groupSize: 2, ...(defaultValue === undefined ? {} : { defaultValue }) })
const tabStops = (container: HTMLElement) => [...container.querySelectorAll('[role="group"] input')].map((cell) => cell.getAttribute('tabindex'))
const values = (container: HTMLElement) => [...container.querySelectorAll('input')].map((input) => input.value)

describe('a server-rendered OTPField hydrates cleanly', () => {
  it('the default is in the server HTML, and the cells and the hidden input hold it after hydration', async () => {
    const { errors, before, container, done } = await hydrate(field('48'))
    expect(before).toContain('name="code" value="48"')
    expect(errors).toEqual([])
    expect(values(container)).toEqual(['4', '8', '', '', '48'])
    done()
  })

  it('the one tab stop is the same cell before and after hydration', async () => {
    const { before, container, done } = await hydrate(field('48'))
    expect(before.match(/tabindex="0"/g)).toHaveLength(1)
    expect(tabStops(container)).toEqual(['-1', '-1', '0', '-1'])
    done()
  })

  it('an Arabic page hydrates with its Arabic cell names and no error', async () => {
    const page = createElement(TopClassProvider, { direction: 'rtl', locale: 'ar' }, field())
    const { errors, container, done } = await hydrate(page)
    expect(errors).toEqual([])
    expect(container.querySelector('#code-2')?.getAttribute('aria-label')).toBe('الخانة 2 من 4')
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'grouped', 'long', 'playground', 'rtl', 'sizes', 'state-matrix', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
