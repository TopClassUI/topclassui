// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)

  const root = await act(() => Promise.resolve(
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } }),
  ))

  onError.mockRestore()
  // testing-library's cleanup knows no hydrateRoot root, so its portal would outlive the test.
  act(() => { root.unmount() })
  container.remove()
  return errors
}

const tooltip = (open: boolean) => createElement(TooltipRoot, { defaultOpen: open },
  createElement(TooltipTrigger, { render: createElement(Button, { 'aria-label': 'Copy link' }) }, 'C'),
  createElement(TooltipPopup, null, 'Copy link'),
)

describe('a server-rendered Tooltip hydrates cleanly', () => {
  it('reports nothing for a closed tooltip, whose trigger id comes from useId on both sides', async () => {
    expect(await hydrate(tooltip(false))).toEqual([])
  })

  it('reports nothing for one open from the start, whose popup mounts only after hydration', async () => {
    expect(await hydrate(tooltip(true))).toEqual([])
  })

  it('opens the popup once hydrated, in a portal outside the server markup', async () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(tooltip(true))
    document.body.appendChild(container)
    expect(container.innerHTML).not.toContain('data-placement')
    expect(document.querySelectorAll('[data-placement]')).toHaveLength(0)
    const root = await act(() => Promise.resolve(hydrateRoot(container, tooltip(true))))
    const popup = document.querySelector('[data-placement]')
    expect(popup?.textContent).toBe('Copy link')
    expect(container.contains(popup)).toBe(false)
    act(() => { root.unmount() })
    container.remove()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBeGreaterThan(5)
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
