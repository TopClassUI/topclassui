import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Field } from '../index.js'
import type { FieldDesignProps } from '../types.js'

type Props = FieldDesignProps & { className?: string }

const html = (props: Props = {}) => markup(
  <Field name="n" label="L" id="i" hint="H" error="E" {...props}>{() => <input id="i" />}</Field>,
)
/** The sorted classes of the last opening tag the pattern matches: the element it leads to. */
const classesOf = (out: string, opening: RegExp) => {
  const tags = (opening.exec(out)?.[0] ?? '').match(/<[a-z]+ [^>]*>/g) ?? []
  return (attr(tags.at(-1) ?? '', 'class') ?? '').split(/\s+/).filter(Boolean).sort()
}
const root = (props: Props = {}) => classesOf(html(props), /^<div [^>]*>/)
const label = (props: Props = {}) => classesOf(html(props), /<label [^>]*>/)
const control = (props: Props = {}) => classesOf(html(props), /<div class="[^"]*"><input/)
const hint = (props: Props = {}) => classesOf(html(props), /<div id="i-hint"[^>]*>/)
const error = (props: Props = {}) => classesOf(html(props), /<div id="i-err"[^>]*>/)
const icon = (props: Props = {}) => classesOf(html(props), /<div id="i-err"[^>]*><span [^>]*>/)
const asterisk = () => classesOf(html({ required: true }), /<label [^>]*>L<span [^>]*>/)

/** Every class on each element, sorted, as unit-5.md's classes.ts gives them: an extra or a missing one both fail. */
describe('stacked, the default', () => {
  it('the root is one column with a gap, and min-w-0 so a long label never widens a grid track', () => {
    expect(root()).toEqual(['content-start', 'gap-1.5', 'grid', 'grid-cols-1', 'min-w-0'])
  })

  it('the label is the body colour, medium weight, and wraps anywhere', () => {
    expect(label()).toEqual(['font-medium', 'text-body', 'text-sm', 'wrap-anywhere'])
  })

  it('the control holder is min-w-0, so a wide control shrinks inside the column', () => {
    expect(control()).toEqual(['min-w-0'])
  })

  it('the hint is muted; the error is danger beside its icon, which is one line tall', () => {
    expect(hint()).toEqual(['text-muted', 'text-sm', 'wrap-anywhere'])
    expect(error()).toEqual(['flex', 'gap-1.5', 'items-start', 'text-danger-on-soft', 'text-sm', 'wrap-anywhere'])
    expect(icon()).toEqual(['flex', 'h-5', 'items-center', 'shrink-0'])
  })

  it('the asterisk takes its colour on the wrapper, never on the svg', () => {
    expect(asterisk()).toEqual(['inline-flex', 'ms-0.5', 'text-danger-on-soft'])
    expect(html({ required: true })).toMatch(/<svg width="0.625em" height="0.625em" [^>]*class="inline-block shrink-0"/)
  })
})

describe('inline', () => {
  it('the root is two columns: the control at its own width, the label in the rest', () => {
    expect(root({ inline: true })).toEqual(['content-start', 'gap-x-2.5', 'gap-y-1', 'grid', 'grid-cols-[auto_minmax(0,1fr)]', 'items-center', 'min-w-0'])
  })

  it('the label sits in the second column of the first row at normal weight; the control in the first', () => {
    expect(label({ inline: true })).toEqual(['col-start-2', 'font-normal', 'row-start-1', 'text-body', 'text-sm', 'wrap-anywhere'])
    expect(control({ inline: true })).toEqual(['col-start-1', 'flex', 'row-start-1'])
  })

  it('the hint and the error sit under the label, in the second column', () => {
    expect(hint({ inline: true })).toContain('col-start-2')
    expect(error({ inline: true })).toContain('col-start-2')
    expect(hint()).not.toContain('col-start-2')
  })
})

describe('what the root takes from the caller', () => {
  it('className last, so it wins a conflict', () => {
    expect(root({ className: 'gap-4' })).toContain('gap-4')
    expect(root({ className: 'gap-4' })).not.toContain('gap-1.5')
  })
})

describe('the parts stay simple', () => {
  it('Field paints no ring, no hover, no transition and no touch target: the control has its own', () => {
    const all = [...root(), ...label(), ...control(), ...hint(), ...error(), ...icon(), ...asterisk()]
    expect(all.filter((c) => /^(hover:|active:|focus|outline-|transition|duration-|min-h-|disabled:|data-)/.test(c))).toEqual([])
  })

  it('uses logical classes only, so a right-to-left page needs nothing', () => {
    const all = [...root({ inline: true }), ...label({ inline: true }), ...asterisk(), ...error()]
    expect(all.filter((c) => /^(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|space-x)/.test(c))).toEqual([])
  })
})
