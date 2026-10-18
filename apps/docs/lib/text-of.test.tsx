import { describe, expect, it } from 'vitest'

import { parseMeta, textOf } from './text-of.js'

describe('textOf', () => {
  it('joins the text of nested elements', () => {
    expect(textOf(['Why there is no ', <code key="c">tailwind.config.js</code>])).toBe('Why there is no tailwind.config.js')
  })

  it('reads nothing from a boolean or null', () => {
    expect(textOf([null, false, 'a'])).toBe('a')
  })
})

describe('parseMeta', () => {
  it('reads the title and the check flag', () => {
    expect(parseMeta('title="app/globals.css" check')).toEqual({ title: 'app/globals.css', check: true })
  })

  it('does not read check inside a title', () => {
    expect(parseMeta('title="check.ts"')).toEqual({ title: 'check.ts', check: false })
  })

  it('reads an empty info string as no title', () => {
    expect(parseMeta(undefined)).toEqual({ check: false })
  })
})
