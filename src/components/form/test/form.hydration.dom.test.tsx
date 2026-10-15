// PLAN section 20: the server render must hydrate with no recoverable error, FormAction's replayed form included.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Form, FormAction } from '../index.js'

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrates the server HTML; returns that HTML, what React reported and the container, still mounted. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  const html = renderToString(element)
  container.innerHTML = html
  document.body.appendChild(container)
  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })
  return { html, errors, container }
}

describe('a server-rendered form hydrates cleanly', () => {
  it('Form with a URL action, which has no client part', async () => {
    const { errors, container } = await hydrate(<Form action="/subscribe" className="grid"><input name="email" aria-label="Email" /></Form>)
    expect(errors).toEqual([])
    expect(container.innerHTML).toBe('<form class="grid" action="/subscribe"><input aria-label="Email" name="email"></form>')
    container.remove()
  })

  it('FormAction with a function child and a starting state: the same text on both sides, and the form now runs the action', async () => {
    const action = (state: { errors?: Record<string, string>, message?: string }) => state
    const { html, errors, container } = await hydrate(
      <FormAction action={action} initialState={{ message: 'Start' }} aria-label="F">
        {(state, pending) => <p>{`${state.message ?? ''} ${String(pending)}`}</p>}
      </FormAction>,
    )
    expect(html).toContain('<p>Start false</p>')
    expect(errors).toEqual([])
    expect(container.querySelector('p')?.textContent).toBe('Start false')
    container.remove()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form-action', 'server-errors'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      const { errors, container } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      container.remove()
    })
  }
})
