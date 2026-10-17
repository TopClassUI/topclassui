// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'
import type { TabsPanelProps, TabsRootProps } from '../types.js'

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

  const root = await act(() => Promise.resolve(
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } }),
  ))
  onError.mockRestore()
  mounted = { root, container }
  return { errors, html, container }
}

const tabs = (root: Partial<TabsRootProps>, panel: Partial<TabsPanelProps> = {}) => createElement(TabsRoot, root,
  createElement(TabsList, { 'aria-label': 'Project' },
    createElement(TabsTab, { value: 'a' }, 'Overview'),
    createElement(TabsTab, { value: 'b' }, 'Activity'),
  ),
  createElement(TabsPanel, { value: 'a' }, 'First panel'),
  createElement(TabsPanel, { value: 'b', ...panel }, 'Second panel'),
)

const shown = (container: HTMLElement) => [...container.querySelectorAll('[role="tabpanel"]:not([hidden])')].map((panel) => panel.textContent)

describe('server-rendered Tabs hydrate cleanly', () => {
  it('reports nothing with a defaultValue: the same panel is shown before and after', async () => {
    const { errors, html, container } = await hydrate(tabs({ defaultValue: 'a' }))
    expect(errors).toEqual([])
    expect(html).toContain('Second panel')
    expect(shown(container)).toEqual(['First panel'])
  })

  it('reports nothing when the page opens on the second tab', async () => {
    const { errors, container } = await hydrate(tabs({ defaultValue: 'b' }))
    expect(errors).toEqual([])
    expect(shown(container)).toEqual(['Second panel'])
  })

  it('reports nothing for a panel left out of the HTML with keepMounted={false}', async () => {
    const { errors, html, container } = await hydrate(tabs({ defaultValue: 'a' }, { keepMounted: false }))
    expect(errors).toEqual([])
    expect(html).not.toContain('Second panel')
    expect(container.querySelectorAll('[role="tabpanel"]')).toHaveLength(1)
  })

  // The cost of leaving defaultValue out: the server shows no panel, and the first appears only now.
  it('with no defaultValue hydrates without error too, and only then opens the first tab', async () => {
    const { errors, html, container } = await hydrate(tabs({}))
    expect(errors).toEqual([])
    expect(html).not.toContain('aria-selected="true"')
    expect(shown(container)).toEqual(['First panel'])
    expect(container.querySelector('[aria-selected="true"]')?.textContent).toBe('Overview')
  })

  it('ties tabs to panels once hydrated: the server HTML cannot', async () => {
    const { html, container } = await hydrate(tabs({ defaultValue: 'a' }))
    expect(html).not.toContain('aria-controls')
    const [first, second] = [...container.querySelectorAll('[role="tab"]')]
    const panels = [...container.querySelectorAll('[role="tabpanel"]')]
    expect(first?.getAttribute('aria-controls')).toBe(panels[0]?.id)
    expect(second?.getAttribute('aria-controls')).toBe(panels[1]?.id)
  })

  const stops = (container: HTMLElement) => [...container.querySelectorAll('[role="tab"]')].map((tab) => tab.getAttribute('tabindex'))

  it('the tab stop the server wrote is the one Base UI takes over: still one, on the same tab', async () => {
    const { errors, html, container } = await hydrate(tabs({ defaultValue: 'b' }))
    expect(errors).toEqual([])
    const served = document.createElement('div')
    served.innerHTML = html
    expect(stops(served)).toEqual(['-1', '0'])
    expect(stops(container)).toEqual(['-1', '0'])
  })

  it('after hydration the tab stop follows the active tab: the one the server wrote is not stuck', async () => {
    const { container } = await hydrate(tabs({ defaultValue: 'a' }))
    const [first, second] = [...container.querySelectorAll('[role="tab"]')] as HTMLElement[]
    expect(stops(container)).toEqual(['0', '-1'])
    act(() => { second?.focus() })
    act(() => { second?.click() })
    expect(second?.getAttribute('aria-selected')).toBe('true')
    expect(stops(container)).toEqual(['-1', '0'])
    expect(first?.getAttribute('tabindex')).toBe('-1')
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBeGreaterThan(8)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} renders on the server without throwing`, () => {
      expect(() => renderToString(createElement(Demo))).not.toThrow()
    })

    it(`${name} hydrates with no recoverable error, and shows the panels the server showed`, async () => {
      const { errors, html, container } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      const served = document.createElement('div')
      served.innerHTML = html
      expect(shown(container)).toEqual(shown(served))
      expect(shown(container).length).toBeGreaterThanOrEqual(1)
    })
  }
})
