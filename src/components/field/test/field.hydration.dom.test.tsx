// PLAN section 20: the server render must hydrate with no recoverable error, and FieldLive with the ids the server wrote.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act } from '@testing-library/react'
import { createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { FormErrorsContext } from '#shared/form-errors.js'
import { FieldLive } from '../index.js'

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

/** Every id, label for and ARIA reference in a tree, in document order. */
const wiring = (root: Element) => [...root.querySelectorAll('[id], [for], [aria-labelledby], [aria-describedby]')]
  .filter((el) => !el.id.startsWith('base-ui-'))
  .map((el) => [el.tagName, el.id, el.getAttribute('for'), el.getAttribute('aria-labelledby'), el.getAttribute('aria-describedby'), el.getAttribute('aria-invalid')].join(' '))

describe('FieldLive hydrates with the ids the server wrote', () => {
  it('two FieldLives, one generated id each: the same label, hint and error ids after hydration, and no warning', async () => {
    const tree = createElement(FormErrorsContext, { value: { terms: 'Accept the terms' } }, createElement('form', null,
      createElement(FieldLive, { name: 'email', label: 'Email', hint: 'Never shared', children: (control) => createElement(Input, control) }),
      createElement(FieldLive, { name: 'terms', label: 'Terms', inline: true, children: (control) => createElement(Checkbox, control) })))
    const host = document.createElement('div')
    host.innerHTML = renderToString(tree)
    const served = wiring(host)
    const { errors, container } = await hydrate(tree)
    expect(errors).toEqual([])
    expect(wiring(container)).toEqual(served)
    expect(served.filter((line) => line.endsWith(' true'))).toHaveLength(1)
    container.remove()
  })

  it('a given id is the same on the server and in the browser', async () => {
    const { html, errors, container } = await hydrate(createElement(FieldLive, {
      name: 'email', id: 'email', label: 'Email', error: 'Taken', children: (control) => createElement(Input, control),
    }))
    expect(errors).toEqual([])
    expect(html).toContain('id="email-err"')
    expect(container.querySelector('input')?.getAttribute('aria-describedby')).toBe('email-err')
    container.remove()
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBe(10)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} hydrates with no recoverable error, and keeps every id and reference the server wrote`, async () => {
      const host = document.createElement('div')
      host.innerHTML = renderToString(createElement(Demo))
      const served = wiring(host)
      const { errors, container } = await hydrate(createElement(Demo))
      expect(errors).toEqual([])
      // Base UI may add a reference once hydrated (OTPField names its group by the label too); none it wrote may go.
      expect(wiring(container)).toEqual(expect.arrayContaining(served))
      container.remove()
    })
  }
})
