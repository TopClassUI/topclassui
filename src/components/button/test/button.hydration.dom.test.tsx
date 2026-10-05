// PLAN section 20: the server render must hydrate with no recoverable error.
import { act, createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '../index.js'
import variants from '../dummy/variants.js'
import tones from '../dummy/tones.js'
import states from '../dummy/states.js'
import sizes from '../dummy/sizes.js'
import fullWidth from '../dummy/full-width.js'
import asLink from '../dummy/as-link.js'
import withIcon from '../dummy/with-icon.js'
import skeleton from '../dummy/skeleton.js'

const DEMOS = { variants, tones, states, sizes, fullWidth, asLink, withIcon, skeleton }

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

describe('a server-rendered Button hydrates cleanly', () => {
  it('reports nothing for the plain button', async () => {
    expect(await hydrate(createElement(Button, null, 'Save'))).toEqual([])
  })

  it('reports nothing while loading, where the markup carries extra attributes', async () => {
    expect(await hydrate(createElement(Button, { loading: true }, 'Saving'))).toEqual([])
  })

  it('reports nothing when the render prop changes the element', async () => {
    const el = createElement(Button, { render: createElement('a', { href: '/x' }) }, 'Go')
    expect(await hydrate(el)).toEqual([])
  })
})

describe('every demo renders and hydrates', () => {
  for (const [name, Demo] of Object.entries(DEMOS)) {
    it(`${name} renders on the server without throwing`, () => {
      expect(() => renderToString(createElement(Demo))).not.toThrow()
    })

    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual([])
    })
  }
})
