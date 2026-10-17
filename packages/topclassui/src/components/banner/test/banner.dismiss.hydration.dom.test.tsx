// What a visitor who dismissed a banner gets on the next page: the server's HTML, then nothing once hydrated.
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Banner } from '../index.js'

// React warns on an update inside act() unless told it runs in a test; the update here is the store's answer.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  document.body.replaceChildren()
})

const page = (id: string) => (
  <main>
    <Banner aria-label="Release announcement" dismissible id={id}>Version 2 is out.</Banner>
    <h1>Projects</h1>
  </main>
)

async function hydrate(id: string) {
  const errors: unknown[] = []
  vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  container.innerHTML = renderToString(page(id))
  document.body.appendChild(container)
  const before = container.innerHTML
  await act(() => {
    hydrateRoot(container, page(id), { onRecoverableError: (error) => { errors.push(error) } })
    return Promise.resolve()
  })
  return { errors, before, after: container.innerHTML }
}

describe('a dismissed banner across a page load', () => {
  it('is in the server HTML even when the storage holds it: the server cannot read it', () => {
    localStorage.setItem('tc-banner-dismissed:ssr-held', '1')
    expect(renderToString(page('ssr-held'))).toContain('Version 2 is out.')
  })

  it('is gone once hydrated, with no recoverable error: the server snapshot is false', async () => {
    localStorage.setItem('tc-banner-dismissed:hydrate-held', '1')
    const { errors, before, after } = await hydrate('hydrate-held')
    expect(before).toContain('Version 2 is out.')
    expect(after).not.toContain('Version 2 is out.')
    expect(after).toBe('<main><h1>Projects</h1></main>')
    expect(errors).toEqual([])
  })

  it('stays, with its x, when nothing was stored', async () => {
    const { errors, after } = await hydrate('hydrate-fresh')
    expect(after).toContain('Version 2 is out.')
    expect(after).toContain('aria-label="Dismiss"')
    expect(errors).toEqual([])
  })
})
