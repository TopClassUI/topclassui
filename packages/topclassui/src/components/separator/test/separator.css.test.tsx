// A class list proves nothing about what paints, so this compiles what the separator emits.
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { classList, markup } from '#test/markup.js'
import { Separator } from '../index.js'

const across = classList(markup(<Separator />))
const down = classList(markup(<Separator orientation="vertical" />))

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build([...across, ...down])
})

/** The declarations of the first rule for a class, with the whitespace folded. */
const rule = (cls: string) => {
  const selector = `.${cls.replace(/[():]/g, (c) => `\\${c}`)} {`
  const at = css.indexOf(selector)
  if (at === -1) return null
  const body = css.slice(at + selector.length, css.indexOf('}', at))
  return body.trim().split(/\s*;\s*/).filter(Boolean)
}

describe('the horizontal line paints one top border at the knob', () => {
  it('spans its container', () => {
    expect(rule('w-full')).toEqual(['width: 100%'])
  })

  it('draws the top border at --tc-line-width, solid', () => {
    expect(rule('border-t-(length:--tc-line-width)')).toEqual([
      'border-top-style: var(--tw-border-style)',
      'border-top-width: var(--tc-line-width)',
    ])
  })

  it('emits only classes that compile, so none of them is dead', () => {
    expect(across.filter((c) => rule(c) === null)).toEqual([])
  })
})

describe('the vertical line is logical, so it mirrors in RTL', () => {
  it('stretches to the height of the row', () => {
    expect(rule('self-stretch')).toEqual(['align-self: stretch'])
  })

  it('draws the inline-start border at --tc-line-width, never a physical side', () => {
    expect(rule('border-s-(length:--tc-line-width)')).toEqual([
      'border-inline-start-style: var(--tw-border-style)',
      'border-inline-start-width: var(--tc-line-width)',
    ])
    expect(css).not.toMatch(/border-(left|right)-width/)
  })

  it('emits only classes that compile, so none of them is dead', () => {
    expect(down.filter((c) => rule(c) === null)).toEqual([])
  })
})

describe('both lines', () => {
  it('take their colour from base/line, the decorative hairline token', () => {
    expect(rule('border-line')).toEqual(['border-color: var(--tc-line)'])
  })
})
