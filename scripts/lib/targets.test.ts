import { Checkbox } from '@base-ui/react/checkbox'
import { Switch } from '@base-ui/react/switch'
import { Window } from 'happy-dom'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, describe, expect, it } from 'vitest'

import { TARGETS } from './targets.js'

const window = new Window()
const { document } = window
afterAll(async () => { await window.happyDOM.close() })

const parse = (html: string) => {
  document.body.innerHTML = html
  return document.body
}

const isTarget = (html: string) => parse(html).querySelector('*')?.matches(TARGETS) === true

describe('the selector of the target-size spec', () => {
  it('skips the hidden input Base UI serves beside a switch, and still measures the switch', () => {
    const body = parse(renderToStaticMarkup(createElement(Switch.Root, { name: 'wifi', 'aria-label': 'Wi-Fi' })))
    const inputs = [...body.querySelectorAll('input')]
    expect(inputs.map((input) => input.getAttribute('aria-hidden'))).toEqual(['true'])
    expect(inputs.map((input) => input.matches(TARGETS))).toEqual([false])
    expect([...body.querySelectorAll(TARGETS)].map((el) => el.getAttribute('role'))).toEqual(['switch'])
  })

  it('skips the input of type hidden Base UI adds for an unchecked value', () => {
    const body = parse(renderToStaticMarkup(createElement(Checkbox.Root, { name: 'terms', uncheckedValue: 'no', 'aria-label': 'Terms' })))
    expect([...body.querySelectorAll('input')].map((input) => input.getAttribute('type'))).toEqual(['hidden', 'checkbox'])
    expect([...body.querySelectorAll(TARGETS)].map((el) => el.getAttribute('role'))).toEqual(['checkbox'])
  })

  it('skips an input of type hidden written by hand', () => {
    expect(isTarget('<input type="hidden" name="token" value="1">')).toBe(false)
  })

  it('measures a plain input', () => {
    expect(isTarget('<input name="q">')).toBe(true)
  })

  it('measures an input that is only aria-hidden: a pointer can still reach it', () => {
    expect(isTarget('<input aria-hidden="true">')).toBe(true)
  })

  it('measures an input that is only out of the tab order: a pointer can still reach it', () => {
    expect(isTarget('<input tabindex="-1">')).toBe(true)
  })

  it('skips an input that is both aria-hidden and out of the tab order: no pointer and no key reaches it', () => {
    expect(isTarget('<input aria-hidden="true" tabindex="-1">')).toBe(false)
  })

  it('measures each toggle role whatever element draws it', () => {
    expect(isTarget('<span role="checkbox" aria-checked="false"></span>')).toBe(true)
    expect(isTarget('<span role="radio" aria-checked="false"></span>')).toBe(true)
    expect(isTarget('<span role="switch" aria-checked="false"></span>')).toBe(true)
  })

  it('still measures buttons, links with an href, selects and textareas, and not a link without one', () => {
    expect(isTarget('<button>Go</button>')).toBe(true)
    expect(isTarget('<a href="/x">Go</a>')).toBe(true)
    expect(isTarget('<a>Go</a>')).toBe(false)
    expect(isTarget('<div role="button">Go</div>')).toBe(true)
    expect(isTarget('<select></select>')).toBe(true)
    expect(isTarget('<textarea></textarea>')).toBe(true)
  })
})
