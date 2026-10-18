// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FileUpload } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. `before` runs on the server HTML first. */
async function hydrate(element: ReactElement, before?: (container: HTMLElement) => void) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)
  before?.(container)
  const root = await act(() => Promise.resolve(hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })))
  onError.mockRestore()
  return { errors, container, done: () => { act(() => { root.unmount() }); container.remove() } }
}

const pdf = (name: string) => new File(['%PDF'], name, { type: 'application/pdf' })

describe('a server-rendered FileUpload hydrates cleanly', () => {
  it('with an empty list and no recoverable error', async () => {
    const { errors, container, done } = await hydrate(createElement(FileUpload, { 'aria-label': 'Files', maxFiles: 3, children: 'Hint' }))
    expect(errors).toEqual([])
    expect(container.querySelectorAll('li')).toHaveLength(0)
    done()
  })

  it('files picked before hydration join the list, inside the limits, and the input keeps only those', async () => {
    const element = createElement(FileUpload, { 'aria-label': 'Files', maxFiles: 2 })
    const { errors, container, done } = await hydrate(element, (served) => {
      const transfer = new DataTransfer()
      for (const name of ['a.pdf', 'b.pdf', 'c.pdf']) transfer.items.add(pdf(name))
      ;(served.querySelector('input') as HTMLInputElement).files = transfer.files
    })
    expect(errors).toEqual([])
    expect([...container.querySelectorAll('li [dir="auto"]')].map((name) => name.textContent)).toEqual(['a.pdf', 'b.pdf'])
    expect([...((container.querySelector('input') as HTMLInputElement).files ?? [])].map((file) => file.name)).toEqual(['a.pdf', 'b.pdf'])
    expect(container.querySelector('[role="status"]')?.textContent).toBe('Only 2 files allowed')
    done()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'in-field', 'multiple', 'playground', 'rtl', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, done } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      done()
    })
  }
})
