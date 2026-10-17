// PLAN section 20: the server render must hydrate with no recoverable error, the copy button included.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getLabels } from '#shared/labels/get-labels.js'
import { CodeBlock } from '../index.js'

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

describe('a server-rendered CodeBlock hydrates cleanly', () => {
  it('with a title and the button: the ids the server wrote are the ids after hydration', async () => {
    const element = createElement(CodeBlock, { title: 'page.tsx', children: 'const a = 1' })
    const { html, errors, container } = await hydrate(element)
    expect(errors).toEqual([])
    expect(container.innerHTML).toBe(html)
    const button = container.querySelector('button')
    const title = container.querySelector('span[dir="auto"]')
    expect(button?.getAttribute('aria-labelledby')).toBe(`${button?.id ?? 'none'} ${title?.id ?? 'none'}`)
    container.remove()
  })

  it('in Arabic, with labels from the server and no provider', async () => {
    const { errors, container } = await hydrate(createElement(CodeBlock, { ...getLabels('ar'), children: 'a' }))
    expect(errors).toEqual([])
    expect(container.querySelector('button')?.getAttribute('aria-label')).toBe('نسخ')
    container.remove()
  })

  it('with no button, which has no client part to hydrate', async () => {
    const { errors, container } = await hydrate(createElement(CodeBlock, { showCopy: false, wrap: true, children: 'a' }))
    expect(errors).toEqual([])
    expect(container.querySelector('button')).toBeNull()
    container.remove()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBe(7)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, container } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      container.remove()
    })
  }
})
