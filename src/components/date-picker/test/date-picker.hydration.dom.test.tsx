// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '../index.js'

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

const inLocale = (locale: string, defaultValue?: string) => createElement(TopClassProvider, {
  direction: locale.startsWith('ar') ? 'rtl' : 'ltr',
  locale,
  children: createElement(DatePicker, { 'aria-label': 'Check-in', name: 'checkIn', ...(defaultValue === undefined ? {} : { defaultValue }) }),
})

describe('a server-rendered DatePicker hydrates cleanly', () => {
  for (const [locale, text] of [['en', 'Sep 22, 2026'], ['en-GB', '22 Sept 2026'], ['ar', '22/09/2026'.replaceAll('/', `${String.fromCodePoint(0x200f)}/`)]] as const) {
    it(`${locale}: the day is in the server HTML as ${text}, the same after hydration, and the value in the input`, async () => {
      const { errors, before, container, done } = await hydrate(inLocale(locale, '2026-09-22'))
      expect(before).toContain(`>${text}</span>`)
      expect(errors).toEqual([])
      expect(container.querySelector('button')?.textContent).toBe(text)
      expect(container.querySelector('input')?.value).toBe('2026-09-22')
      done()
    })
  }

  it('the placeholder, with nothing chosen, is the same before and after, and the trigger is the one tab stop', async () => {
    const { errors, before, container, done } = await hydrate(inLocale('en'))
    expect(before).toContain('>Pick a date</span>')
    expect(before.match(/tabindex="0"/g)).toEqual(['tabindex="0"'])
    expect(errors).toEqual([])
    expect(container.querySelectorAll('button')).toHaveLength(1)
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'in-field', 'limits', 'rtl', 'sizes', 'states', 'week-start'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
