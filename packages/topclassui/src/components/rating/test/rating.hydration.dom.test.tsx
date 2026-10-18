// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Rating } from '../index.js'

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

afterEach(() => { vi.restoreAllMocks() })

/** Hydrates the server HTML, hands the live container to a reader, and reports what React considered a mismatch. */
async function hydrate(element: ReactElement, read: (container: HTMLElement) => Promise<void> | void = () => undefined) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)
  const root = await act(() => Promise.resolve(hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })))
  await read(container)
  onError.mockRestore()
  act(() => { root.unmount() })
  container.remove()
  return errors
}

const sent = (container: HTMLElement) => {
  const form = container.querySelector('form')
  return form ? [...new FormData(form)].map(([key, value]) => `${key}=${value as string}`) : null
}

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.map(([name]) => name)).toEqual(['controlled', 'disabled', 'editable', 'in-form', 'max-ten', 'playground', 'read-only', 'rtl', 'sizes', 'states'])
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual([])
    })
  }
})

describe('a form works before any script runs, and after', () => {
  const Form = DEMOS.find(([name]) => name === 'in-form')?.[1] as ComponentType

  it('the server HTML checks the default step, with its name and value, so it submits as it is', () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(createElement(Form))
    expect(sent(container)).toEqual(['stay=4'])
    expect(container.querySelectorAll('input[type="radio"][name="stay"]')).toHaveLength(5)
  })

  it('after hydration a click changes what is submitted, and reset brings the server\'s step back', async () => {
    const errors = await hydrate(createElement(Form), async (container) => {
      expect(sent(container)).toEqual(['stay=4'])
      await userEvent.click(container.querySelectorAll('input')[1] as HTMLInputElement)
      expect(sent(container)).toEqual(['stay=2'])
      act(() => { container.querySelector('form')?.reset() })
      expect(sent(container)).toEqual(['stay=4'])
    })
    expect(errors).toEqual([])
  })

  it('the group name an unnamed rating makes for itself is the same on both sides', async () => {
    const element = createElement(Rating, { readOnly: false, 'aria-label': 'Stay' })
    const served = /name="([^"]+)"/.exec(renderToString(element))?.[1]
    const errors = await hydrate(element, (container) => {
      expect([...container.querySelectorAll('input')].map((radio) => radio.name)).toEqual([served, served, served, served, served])
    })
    expect(errors).toEqual([])
  })
})
