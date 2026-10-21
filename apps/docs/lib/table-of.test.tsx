import { describe, expect, it } from 'vitest'

import { columnFit, defaultLines } from './table-of.js'

describe('columnFit', () => {
  it('keeps a column of short cells on one line, the framework name included', () => {
    expect(columnFit('Framework', ['Next.js 15 or 16, App Router', 'Vite single-page app'], false)).toBe('fit')
    expect(columnFit('Package', [<code key="r">react</code>, <code key="t">tailwindcss</code>], false)).toBe('fit')
  })

  it('wraps a column once one cell, or the header, is longer than 32 characters', () => {
    expect(columnFit('What', ['Body and muted text', 'A control boundary, on every surface it can sit on'], false)).toBe('wrap')
    expect(columnFit('A header that is longer than thirty-two', ['1'], false)).toBe('wrap')
  })

  it('gives the last column the prose floor, however short its cells', () => {
    expect(columnFit('Tier', ['1', '2'], true)).toBe('prose')
  })
})

describe('defaultLines', () => {
  it('puts each entry of a printed object on its own line', () => {
    expect(defaultLines("{ placement: 'bottom-end', limit: 3, duration: 5000, tone: 'neutral' }")).toEqual([
      "{ placement: 'bottom-end',",
      'limit: 3,',
      'duration: 5000,',
      "tone: 'neutral' }",
    ])
  })

  it('splits only at the top level, never inside a nested object or a quoted string', () => {
    expect(defaultLines("{ a: { b: 1, c: 2 }, d: 'x, y' }")).toEqual(['{ a: { b: 1, c: 2 },', "d: 'x, y' }"])
  })

  it('leaves a one-entry object and anything else on one line', () => {
    expect(defaultLines("{ query: '(width < 48rem)' }")).toEqual(["{ query: '(width < 48rem)' }"])
    expect(defaultLines('-')).toEqual(['-'])
    expect(defaultLines("'latn'")).toEqual(["'latn'"])
  })
})
