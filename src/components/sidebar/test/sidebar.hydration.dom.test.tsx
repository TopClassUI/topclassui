// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'
import type { SidebarRootProps } from '../types.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

let mounted: { root: Root, container: HTMLElement } | undefined

afterEach(() => {
  vi.restoreAllMocks()
  // testing-library's cleanup knows no hydrateRoot root.
  if (mounted) { act(() => { mounted?.root.unmount() }); mounted.container.remove(); mounted = undefined }
})

/** Hydrates the server HTML and reports anything React considers a mismatch. The tree stays mounted for the test. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  const html = renderToString(element)
  container.innerHTML = html
  document.body.appendChild(container)
  // What the browser holds before any script: the page the server sent, parsed.
  const served = container.innerHTML

  const root = await act(() => Promise.resolve(
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } }),
  ))
  onError.mockRestore()
  mounted = { root, container }
  return { errors, html, served, container }
}

const rail = (props: Partial<SidebarRootProps> = {}) => createElement(SidebarRoot, props,
  createElement(SidebarHeader, null, 'Workspace'),
  createElement(SidebarBody, null,
    createElement(SidebarGroup, { label: 'Pages' },
      createElement(SidebarLink, { href: '/home', current: true, children: 'Home' }),
      createElement(SidebarLink, { href: '/team', children: 'Team' }),
    ),
    createElement(SidebarGroup, { label: 'Account' }, createElement(SidebarLink, { href: '/settings', children: 'Settings' })),
  ),
)

/** Which of the two states each nav on the page is in: what a stylesheet reads to size the rail. */
const states = (container: HTMLElement) => [...container.querySelectorAll('nav')].map((nav) => (
  nav.hasAttribute('data-open') ? (nav.hasAttribute('data-closed') ? 'both' : 'open') : (nav.hasAttribute('data-closed') ? 'closed' : 'neither')
))

describe('a server-rendered rail hydrates cleanly', () => {
  it('reports nothing for an expanded rail, and leaves the HTML the server sent exactly as it was', async () => {
    const { errors, html, served, container } = await hydrate(rail())
    expect(errors).toEqual([])
    expect(html).toContain(' data-open=""')
    expect(states(container)).toEqual(['open'])
    expect(container.innerHTML).toBe(served)
  })

  // The state is in the server HTML, so no effect has to collapse the rail after the first paint: no flash.
  it('reports nothing for a rail collapsed from the start: it is collapsed before and after, and not one attribute changes', async () => {
    const { errors, html, served, container } = await hydrate(rail({ defaultOpen: false }))
    expect(errors).toEqual([])
    expect(html).toContain(' data-closed=""')
    expect(html).not.toContain(' data-open=""')
    expect(states(container)).toEqual(['closed'])
    expect(container.innerHTML).toBe(served)
  })

  it('reports nothing for a rail whose caller holds it collapsed', async () => {
    const { errors, served, container } = await hydrate(rail({ open: false }))
    expect(errors).toEqual([])
    expect(states(container)).toEqual(['closed'])
    expect(container.innerHTML).toBe(served)
  })

  it('the ids useId made on the server still tie each label to its list', async () => {
    const { errors, container } = await hydrate(rail())
    expect(errors).toEqual([])
    const lists = [...container.querySelectorAll('ul')]
    expect(lists.map((list) => container.querySelector(`[id="${list.getAttribute('aria-labelledby') ?? ''}"]`)?.textContent)).toEqual(['Pages', 'Account'])
  })

  it('is live once hydrated: a press on the toggle collapses the rail the server sent expanded', async () => {
    const { container } = await hydrate(rail())
    const toggle = container.querySelector('button')
    act(() => { toggle?.click() })
    expect(states(container)).toEqual(['closed'])
    expect(toggle?.getAttribute('aria-expanded')).toBe('false')
    expect(toggle?.getAttribute('aria-label')).toBe('Expand the sidebar')
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.map(([name]) => name)).toEqual(['basic', 'collapsed', 'controlled', 'groups', 'in-a-layout', 'long-list', 'rtl'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} renders on the server without throwing`, () => {
      expect(() => renderToString(createElement(Demo))).not.toThrow()
    })

    it(`${name} hydrates with no recoverable error, in the state the server sent`, async () => {
      const { errors, html, container } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      expect(states(container)).toEqual([name === 'collapsed' ? 'closed' : 'open'])
      expect(html.includes(' data-closed=""')).toBe(name === 'collapsed')
    })
  }
})
