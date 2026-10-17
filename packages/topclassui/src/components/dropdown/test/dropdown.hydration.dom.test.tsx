// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, waitFor } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownMenu, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

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

const dropdown = (open: boolean) => (
  <DropdownRoot defaultOpen={open}>
    <DropdownTrigger render={<Button>Actions</Button>} />
    <DropdownPopup>
      <DropdownItem shortcut="F2">Rename</DropdownItem>
      <DropdownItem tone="danger">Delete</DropdownItem>
    </DropdownPopup>
  </DropdownRoot>
)

const data = (open: boolean) => (
  <DropdownMenu
    defaultOpen={open}
    trigger={<Button>Account</Button>}
    title="Account"
    link={<a data-link="app" href="" />}
    items={[{ id: 'profile', label: 'Profile', href: '/profile' }, { id: 'signout', label: 'Sign out', action: () => undefined }]}
  />
)

describe('a server-rendered Dropdown hydrates cleanly', () => {
  it('reports nothing for a closed menu, whose trigger id and scope come from useId on both sides', async () => {
    expect(await hydrate(dropdown(false))).toEqual([])
  })

  it('reports nothing for one open from the start, whose menu mounts only after hydration', async () => {
    expect(await hydrate(dropdown(true))).toEqual([])
  })

  it('reports nothing for the data-driven menu, closed or open from the start', async () => {
    expect(await hydrate(data(false))).toEqual([])
    expect(await hydrate(data(true))).toEqual([])
  })

  it('renders no menu on the server, even for one open from the start', () => {
    const html = renderToString(dropdown(true))
    expect(html).not.toContain('role="menu"')
    expect(html).not.toContain('Rename')
  })

  it('opens the menu once hydrated, in a portal outside the server markup', async () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(dropdown(true))
    document.body.appendChild(container)
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(0)
    const root = await act(() => Promise.resolve(hydrateRoot(container, dropdown(true))))
    await waitFor(() => { expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1) })
    const menu = document.querySelector('[role="menu"]')
    expect(menu?.textContent).toBe('RenameF2Delete')
    expect(container.contains(menu)).toBe(false)
    act(() => { root.unmount() })
    container.remove()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS).toHaveLength(11)
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
