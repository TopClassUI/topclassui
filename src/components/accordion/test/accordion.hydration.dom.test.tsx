// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, waitFor } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrates the server HTML, hands the live container to a reader, and reports what React considered a mismatch. */
async function hydrate(element: ReactElement, read: (container: HTMLElement) => Promise<void> | void = () => undefined) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)

  const root = await act(() => Promise.resolve(
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } }),
  ))
  await read(container)

  onError.mockRestore()
  act(() => { root.unmount() })
  container.remove()
  return errors
}

const faq = (open: string[]) => createElement(AccordionRoot, { defaultValue: open },
  createElement(AccordionItem, { value: 'one', title: 'One' }, 'First answer.'),
  createElement(AccordionItem, { value: 'two', title: 'Two' }, 'Second answer.'),
)

const panels = (container: HTMLElement) => [...container.querySelectorAll('[role="region"]')].map((region) => region.parentElement)

describe('a server-rendered Accordion hydrates cleanly', () => {
  it('reports nothing for a closed accordion: the trigger ids come from useId on both sides', async () => {
    expect(await hydrate(faq([]))).toEqual([])
  })

  it('reports nothing for one with an item open from the start', async () => {
    expect(await hydrate(faq(['two']))).toEqual([])
  })

  it('a closed panel leaves the server as hidden, and becomes hidden until found once the script has run', async () => {
    const sent = renderToString(faq(['two']))
    expect(sent.match(/ hidden="[^"]*"/g)).toEqual([' hidden=""'])
    const errors = await hydrate(faq(['two']), async (container) => {
      await waitFor(() => { expect(panels(container).map((panel) => panel?.getAttribute('hidden'))).toEqual(['until-found', null]) })
    })
    expect(errors).toEqual([])
  })

  it('keeps the region named by its trigger after hydration, with the id the server wrote', async () => {
    const sent = renderToString(faq([]))
    const id = /<button [^>]*id="([^"]+)"/.exec(sent)?.[1]
    await hydrate(faq([]), (container) => {
      expect(container.querySelector('button')?.id).toBe(id)
      expect(container.querySelector('[role="region"]')?.getAttribute('aria-labelledby')).toBe(id)
    })
    expect(id).toMatch(/^_R_\w+_$/)
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.map(([name]) => name)).toEqual(['basic', 'disabled', 'first-open', 'long-content', 'many-items', 'multiple', 'playground', 'rtl', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual([])
    })
  }
})
