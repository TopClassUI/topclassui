// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

const mounted: Array<{ root: Root, container: HTMLElement }> = []

afterEach(() => {
  for (const { root, container } of mounted.splice(0)) {
    act(() => { root.unmount() })
    container.remove()
  }
  vi.restoreAllMocks()
})

/** Hydrate the server HTML and report anything React considers a mismatch. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  const served = renderToString(element)
  container.innerHTML = served
  document.body.appendChild(container)

  await act(() => {
    mounted.push({ root: hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } }), container })
    return Promise.resolve()
  })

  onError.mockRestore()
  return { errors, served, container }
}

const bar = (sticky: boolean) => createElement(NavbarRoot, { sticky },
  createElement(NavbarBrand, { href: '/' }, 'TopClass UI'),
  createElement(NavbarLinks, null, createElement(NavbarLink, { href: '/docs', current: true }, 'Docs')),
)

describe('a server-rendered Navbar hydrates cleanly', () => {
  it('reports nothing for a sticky bar, and leaves the markup the server sent', async () => {
    const { errors, served, container } = await hydrate(bar(true))
    expect(errors).toEqual([])
    expect(container.innerHTML).toBe(served)
  })

  it('reports nothing for a bar that is not sticky', async () => {
    expect((await hydrate(bar(false))).errors).toEqual([])
  })

  it('the server HTML carries no height: the variable is written by the effect, after hydration', async () => {
    expect(renderToString(bar(true))).not.toContain('--tc-sticky-top')
    await hydrate(bar(true))
    // happy-dom measures every box as 0, so the value says the effect ran, not how tall the bar is.
    expect(document.documentElement.style.getPropertyValue('--tc-sticky-top')).toBe('0px')
  })

  it('and it is gone again once the bar unmounts', async () => {
    await hydrate(bar(true))
    const [first] = mounted.splice(0)
    act(() => { first?.root.unmount() })
    first?.container.remove()
    expect(document.documentElement.style.getPropertyValue('--tc-sticky-top')).toBe('')
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.map(([name]) => name)).toEqual(['basic', 'many-links', 'not-sticky', 'rtl', 'tall-page', 'with-search'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} renders on the server without throwing`, () => {
      expect(() => renderToString(createElement(Demo))).not.toThrow()
    })

    it(`${name} hydrates with no recoverable error`, async () => {
      expect((await hydrate(createElement(Demo))).errors).toEqual([])
    })
  }
})
