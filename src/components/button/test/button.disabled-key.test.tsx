import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '../index.js'
import type { ButtonProps } from '../types.js'

type Props = Record<string, unknown>

/** The props of the host element Button returns: what a Server Component hands to Flight. */
const propsOf = (props: ButtonProps = {}) => (Button(props) as ReactElement<Props>).props

/** The keys that reach a client file: Flight deletes a key whose value is undefined, and keeps one that holds false. */
const crossing = (props: ButtonProps = {}) =>
  Object.entries(propsOf(props)).filter(([, value]) => value !== undefined).map(([key]) => key).sort()

// A part that takes this Button as render merges its own props under the Button's: a disabled key that crossed would win.
describe('a button that is not disabled writes no disabled key', () => {
  it('holds undefined, never false, so nothing of it crosses to a client part', () => {
    expect(propsOf()['disabled']).toBeUndefined()
    expect(crossing()).not.toContain('disabled')
  })

  it('the same with disabled={false} written out', () => {
    expect(propsOf({ disabled: false })['disabled']).toBeUndefined()
    expect(crossing({ disabled: false })).not.toContain('disabled')
  })

  it('exactly six keys cross for a plain button with a label, and none of them is a state', () => {
    expect(crossing({ children: 'Save' })).toEqual(['children', 'className', 'data-size', 'data-tone', 'data-variant', 'type'])
  })
})

describe('a button that is disabled or loading still writes it', () => {
  it('disabled writes true, and the mark that dims it', () => {
    expect(propsOf({ disabled: true })['disabled']).toBe(true)
    expect(crossing({ disabled: true })).toEqual(['className', 'data-disabled', 'data-size', 'data-tone', 'data-variant', 'disabled', 'type'])
  })

  it('loading writes true as well, so a busy button takes no press', () => {
    expect(propsOf({ loading: true })['disabled']).toBe(true)
  })

  it('disabled={false} cannot take it back while loading', () => {
    expect(propsOf({ disabled: false, loading: true })['disabled']).toBe(true)
  })
})

describe('an element that is not a button never gets the attribute', () => {
  type State = { disabled?: boolean, loading?: boolean }
  const link = (state: State = {}) => propsOf({ render: <a href="/x" />, ...state })

  it('an enabled anchor writes neither disabled nor aria-disabled', () => {
    expect([link()['disabled'], link()['aria-disabled']]).toEqual([undefined, undefined])
  })

  it('a disabled anchor writes aria-disabled, and still no disabled', () => {
    expect([link({ disabled: true })['disabled'], link({ disabled: true })['aria-disabled']]).toEqual([undefined, true])
  })

  it('a button passed as render is a real button: it follows the same rule as the default one', () => {
    const own = (state: State = {}) => propsOf({ render: <button type="button" />, ...state })['disabled']
    expect([own(), own({ disabled: true }), own({ loading: true })]).toEqual([undefined, true, true])
  })
})
