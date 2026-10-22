import { describe, expect, it } from 'vitest'

import { columnFit, defaultLines } from './table-of.js'

describe('columnFit', () => {
  it('keeps a column of short cells on one line, the framework name included', () => {
    expect(columnFit('Framework', ['Next.js 15 or 16, App Router', 'Vite single-page app'], false)).toBe('fit')
    expect(columnFit('Package', [<code key="r">react</code>, <code key="t">tailwindcss</code>], false)).toBe('fit')
  })

  it('wraps a column once one cell, or the header, is longer than 34 characters', () => {
    expect(columnFit('What', ['Body and muted text', 'A control boundary, on every surface it can sit on'], false)).toBe('wrap')
    expect(columnFit('A header that is longer than thirty-two', ['1'], false)).toBe('wrap')
  })

  it('keeps a short last column on one line at the end, and gives a long one the prose floor', () => {
    expect(columnFit('Minimum', ['4.5:1', '3:1'], true)).toBe('fit')
    expect(columnFit('What it is for', ['The page behind everything', 'A tint, for a chip or a hovered row in a list'], true)).toBe('prose')
  })

  it('keeps the 33-character split chip on one line', () => {
    expect(columnFit('Chip', ['split - 0 KB server + n KB client'], false)).toBe('fit')
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
