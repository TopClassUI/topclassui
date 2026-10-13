// PLAN section 20: the server render must hydrate with no recoverable error.
import { Toast } from '@base-ui/react/toast'
import { act } from '@testing-library/react'
import type { ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { toastManager } from '../toast/manager.js'
import { TopClassProvider } from './provider.js'

afterEach(() => { vi.restoreAllMocks() })

function Titles() {
  const { toasts } = Toast.useToastManager()
  return <p data-testid="titles">{toasts.map((toast) => <span key={toast.id}>{toast.title}</span>)}</p>
}

const page = (
  <TopClassProvider direction="ltr" locale="en" toast={{ placement: 'top', limit: 2, duration: 0 }}>
    <main>page</main>
    <Titles />
  </TopClassProvider>
)

const island = (
  <TopClassProvider direction="ltr" locale="en">
    <main>page</main>
    <TopClassProvider direction="rtl" locale="ar" toast={{ limit: 5 }}><aside>island</aside></TopClassProvider>
  </TopClassProvider>
)

/** Hydrates the server HTML, runs `then` on the live tree, and returns what React reported. */
async function hydrate(element: ReactElement, then: (container: HTMLElement) => void = () => undefined) {
  const errors: unknown[] = []
  vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)
  const server = container.innerHTML

  const root = await act(() => Promise.resolve(
    hydrateRoot(container, element, { onRecoverableError: (error) => { errors.push(error) } }),
  ))
  const hydrated = container.innerHTML
  then(container)

  // testing-library's cleanup knows no hydrateRoot root.
  act(() => { root.unmount() })
  container.remove()
  return { errors, server, hydrated }
}

describe('a page inside TopClassProvider', () => {
  it('renders no element for the toast provider: no viewport is mounted until the Toast component adds it', () => {
    expect(renderToString(page))
      .toBe('<div class="isolate"><main>page</main><p data-testid="titles"></p></div>')
  })

  it('hydrates with no recoverable error and no console error, and leaves the markup as the server wrote it', async () => {
    const { errors, server, hydrated } = await hydrate(page)
    expect(errors).toEqual([])
    expect(hydrated).toBe(server)
  })

  it('hydrates an RTL island inside it the same way', async () => {
    const { errors, server, hydrated } = await hydrate(island)
    expect(errors).toEqual([])
    expect(hydrated).toBe(server)
    expect(server).toBe('<div class="isolate"><main>page</main><div class="contents"><aside>island</aside></div></div>')
  })

  it('holds no toast in the server markup even when one was added before the render: the server has no listener', () => {
    toastManager.add({ title: 'Too early' })
    expect(renderToString(page)).not.toContain('Too early')
  })

  it('takes a toast once hydrated, since the provider subscribes to the manager in an effect', async () => {
    const seen: string[] = []
    const { errors } = await hydrate(page, (container) => {
      act(() => { toastManager.add({ title: 'Saved' }) })
      seen.push(container.querySelector('[data-testid="titles"]')?.textContent ?? 'missing')
    })
    expect(seen).toEqual(['Saved'])
    expect(errors).toEqual([])
  })
})
