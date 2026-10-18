// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'

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

  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })

  onError.mockRestore()
  container.remove()
  return errors
}

describe('a server-rendered Avatar hydrates cleanly', () => {
  it('reports nothing for an image over its fallback', async () => {
    const avatar = createElement(AvatarRoot, { size: 'lg' },
      createElement(AvatarImage, { src: '/team/omar.jpg', alt: 'Omar Abed' }),
      createElement(AvatarFallback, null, 'OA'),
    )
    expect(await hydrate(avatar)).toEqual([])
  })

  it('reports nothing for the skeleton, whose only content is a space', async () => {
    expect(await hydrate(createElement(AvatarSkeleton, { size: 'xl' }))).toEqual([])
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'custom-size', 'failed', 'icon', 'playground', 'rtl', 'sizes', 'skeleton', 'states', 'with-name'])
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
