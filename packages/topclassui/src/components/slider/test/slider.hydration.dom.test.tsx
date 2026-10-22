// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Slider } from '../index.js'

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

const values = (container: HTMLElement) => [...container.querySelectorAll('input')].map((input) => input.value)
const places = (container: HTMLElement) => [...container.querySelectorAll('[data-index]')].map((thumb) => (thumb as HTMLElement).style.insetInlineStart)

describe('a server-rendered Slider hydrates cleanly', () => {
  it('one thumb: the value and the place are the server\'s before hydration and the same after it', async () => {
    const { errors, before, container, done } = await hydrate(createElement(Slider, { 'aria-label': 'Volume', name: 'volume', defaultValue: 60 }))
    expect(before).toContain('inset-inline-start:60%')
    expect(errors).toEqual([])
    expect([values(container), places(container)]).toEqual([['60'], ['60%']])
    done()
  })

  it('a range under an Arabic provider, with its value shown in Arabic digits, hydrates with no text repaired', async () => {
    const element = createElement(
      TopClassProvider,
      { direction: 'rtl', locale: 'ar', numberingSystem: 'arab' },
      createElement(Slider<readonly [number, number]>, { 'aria-label': 'Price', defaultValue: [20, 80], showValue: true }),
    )
    const { errors, before, container, done } = await hydrate(element)
    expect(errors).toEqual([])
    expect(before).toContain('>٢٠ – ٨٠</output>')
    expect(container.querySelector('output')?.textContent).toBe('٢٠ – ٨٠')
    expect([values(container), places(container)]).toEqual([['20', '80'], ['20%', '80%']])
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'combined', 'form', 'playground', 'range', 'rtl', 'show-value', 'sizes', 'stage', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
