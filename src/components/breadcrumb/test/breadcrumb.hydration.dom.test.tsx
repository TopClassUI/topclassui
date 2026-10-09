// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, createElement, type ComponentType } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { Breadcrumb } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. */
async function hydrate(element: Parameters<typeof renderToString>[0]) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)

  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })

  onError.mockRestore()
  container.remove()
  return errors
}

describe('a server-rendered Breadcrumb hydrates cleanly', () => {
  it('reports nothing for links, a current page and the JSON-LD script', async () => {
    const items = [{ href: '/', label: 'Home' }, { href: '/docs', label: 'Docs' }, { label: 'Breadcrumb' }]
    expect(await hydrate(createElement(Breadcrumb, { items }))).toEqual([])
  })

  it('reports nothing for a trail with no link, which has no script', async () => {
    expect(await hydrate(createElement(Breadcrumb, { items: [{ label: 'Home' }] }))).toEqual([])
  })

  it('reports nothing for an empty trail, which renders nothing', async () => {
    expect(await hydrate(createElement(Breadcrumb, { items: [] }))).toEqual([])
  })

  it('reports nothing for Arabic labels', async () => {
    const items = [{ href: '/', label: 'الرئيسية' }, { label: 'مسار التنقل' }]
    expect(await hydrate(createElement(Breadcrumb, { items, labels: ar }))).toEqual([])
  })

  it('reports nothing for a label that had to be escaped inside the script', async () => {
    const items = [{ href: '/x', label: '</script><script>alert(1)</script>' }, { label: 'Tom & "Jerry"' }]
    expect(await hydrate(createElement(Breadcrumb, { items }))).toEqual([])
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBeGreaterThan(4)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} renders on the server without throwing`, () => {
      expect(() => renderToString(createElement(Demo))).not.toThrow()
    })

    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual([])
    })
  }
})
