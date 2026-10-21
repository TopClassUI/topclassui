// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. `before` runs on the served HTML first. */
async function hydrate(element: ReactElement, before: (container: HTMLElement) => void = () => undefined) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)
  before(container)
  const root = await act(() => Promise.resolve(hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })))
  onError.mockRestore()
  return { errors, container, done: () => { act(() => { root.unmount() }); container.remove() } }
}

const visible = (container: HTMLElement) => container.querySelector('input[type="text"]') as HTMLInputElement
const hidden = (container: HTMLElement) => container.querySelector('input[type="number"]') as HTMLInputElement

describe('a server-rendered NumberField hydrates cleanly', () => {
  it('the clamped default is in the server HTML and is the same after hydration', async () => {
    const { errors, container, done } = await hydrate(createElement(NumberField, { 'aria-label': 'A', name: 'a', defaultValue: 50, max: 10 }))
    expect(errors).toEqual([])
    expect([visible(container).value, hidden(container).value]).toEqual(['10', '10'])
    done()
  })

  it('a number typed before hydration is replaced by the default, so the screen and the form agree', async () => {
    const { errors, container, done } = await hydrate(
      createElement(NumberField, { 'aria-label': 'A', name: 'guests', defaultValue: 2 }),
      (served) => { visible(served).value = '7' },
    )
    expect(errors).toEqual([])
    expect([visible(container).value, hidden(container).value]).toEqual(['2', '2'])
    done()
  })

  it('ar with Latin digits prints the same text on the server and in the browser', async () => {
    const element = createElement(TopClassProvider, { direction: 'rtl', locale: 'ar' }, createElement(NumberField, { 'aria-label': 'A', defaultValue: 1234.5, step: 'any' }))
    const served = renderToString(element)
    const { errors, container, done } = await hydrate(element)
    expect(errors).toEqual([])
    expect(served).toContain('value="1,234.5"')
    expect(visible(container).value).toBe('1,234.5')
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'limits', 'playground', 'row', 'rtl', 'sizes', 'state-matrix', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
