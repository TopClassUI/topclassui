import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { attr, markup } from '#test/markup.js'
import { Spinner } from '../index.js'
import type { SpinnerProps } from '../types.js'

const html = (props: SpinnerProps = {}) => markup(<Spinner {...props} />)

/** Named: an img with an aria-label and nothing hiding it. */
const named = (html_: string, name: string) => {
  expect(attr(html_, 'role')).toBe('img')
  expect(attr(html_, 'aria-label')).toBe(name)
  expect(html_).not.toContain('aria-hidden')
}

/** Decorative: hidden, with no role and no name left behind. */
const hidden = (html_: string) => {
  expect(attr(html_, 'aria-hidden')).toBe('true')
  expect(html_).not.toContain('role=')
  expect(html_).not.toContain('aria-label')
}

describe('the accessible name', () => {
  it('is "Loading" from the English labels when nothing is passed', () => {
    named(html(), 'Loading')
  })

  it('comes from the labels prop, so Arabic names it in Arabic', () => {
    named(html({ labels: ar }), 'جارٍ التحميل')
  })

  it('reads labels and never forwards the object onto the svg', () => {
    expect(html({ labels: ar })).not.toContain('labels=')
  })

  it('follows a caller who changes the one string', () => {
    const labels = { ...en, common: { ...en.common, loading: 'Fetching results' } }
    named(html({ labels }), 'Fetching results')
  })

  it('is the caller aria-label in place of the built-in one, whatever the labels say', () => {
    named(html({ 'aria-label': 'Saving the invoice' }), 'Saving the invoice')
    named(html({ 'aria-label': 'Saving the invoice', labels: ar }), 'Saving the invoice')
  })

  it('falls back to the labels for an empty aria-label, which would name nothing', () => {
    named(html({ 'aria-label': '' }), 'Loading')
  })
})

describe('aria-hidden makes it decorative', () => {
  it('passes no label, so it is hidden with no role and no name', () => {
    hidden(html({ 'aria-hidden': true }))
  })

  it('reads the string form React also accepts', () => {
    hidden(html({ 'aria-hidden': 'true' }))
  })

  it('drops a caller aria-label too, so a hidden spinner never carries a name', () => {
    hidden(html({ 'aria-hidden': true, 'aria-label': 'Saving the invoice' }))
  })

  it('keeps the name for aria-hidden false, in either form', () => {
    named(html({ 'aria-hidden': false }), 'Loading')
    named(html({ 'aria-hidden': 'false' }), 'Loading')
  })

  it('keeps its own label when a caller smuggles one in', () => {
    hidden(html({ label: 'Saving', 'aria-hidden': true } as SpinnerProps))
    named(html({ label: '' } as SpinnerProps), 'Loading')
  })
})

describe('it stays silent', () => {
  it('is an img, never a status, so a screen reader is not interrupted', () => {
    const html_ = html()
    expect(html_).not.toContain('role="status"')
    expect(html_).not.toContain('aria-live')
    expect(html_).not.toContain('aria-busy')
  })

  it('stays an img when a caller forces a role, because Svg sets the role itself', () => {
    const forced = { role: 'status' } as SpinnerProps
    expect(attr(html(forced), 'role')).toBe('img')
  })

  it('is never focusable, because nothing about it can be activated', () => {
    const html_ = html()
    expect(attr(html_, 'focusable')).toBe('false')
    expect(html_).not.toContain('tabindex')
  })
})
