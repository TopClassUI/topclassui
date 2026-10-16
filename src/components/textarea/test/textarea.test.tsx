import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Textarea, TextareaSkeleton } from '../index.js'
import type { TextareaProps } from '../types.js'

const html = (props: Partial<TextareaProps> = {}) => markup(<Textarea aria-label="Message" {...props} />)

/** The opening tag of the textarea alone, wherever it sits in the markup. */
const tagOf = (out: string) => /<textarea [^>]*>/.exec(out)?.[0] ?? ''
const on = (props: Partial<TextareaProps>, name: string) => attr(tagOf(html(props)), name)
const classesOf = (props: Partial<TextareaProps> = {}) => (on(props, 'class') ?? '').split(' ')

describe('a plain Textarea is server HTML and nothing else', () => {
  it('is one native textarea with nothing around it', () => {
    expect(html()).toMatch(/^<textarea [^<>]*><\/textarea>$/)
  })

  it('reports the default size and three rows', () => {
    expect(on({}, 'data-size')).toBe('md')
    expect(on({}, 'rows')).toBe('3')
  })

  it('carries the name it was given, each of the three ways', () => {
    expect(attr(html(), 'aria-label')).toBe('Message')
    expect(attr(markup(<Textarea id="message" />), 'id')).toBe('message')
    expect(attr(markup(<Textarea aria-labelledby="message-label" />), 'aria-labelledby')).toBe('message-label')
  })

  it('passes every native textarea prop through, the form ones included', () => {
    const out = tagOf(html({
      name: 'bio', placeholder: 'Write', required: true, minLength: 10, form: 'f', dir: 'auto',
      disabled: true, autoComplete: 'off', title: 'Bio', wrap: 'hard', cols: 30,
    }))
    expect([attr(out, 'name'), attr(out, 'placeholder'), attr(out, 'required'), attr(out, 'minLength'), attr(out, 'form')])
      .toEqual(['bio', 'Write', '', '10', 'f'])
    expect([attr(out, 'dir'), attr(out, 'disabled'), attr(out, 'autoComplete'), attr(out, 'title'), attr(out, 'wrap'), attr(out, 'cols')])
      .toEqual(['auto', '', 'off', 'Bio', 'hard', '30'])
  })

  it('writes the default text inside the element, where a form reset finds it', () => {
    expect(html({ defaultValue: 'Hello' })).toContain('>Hello</textarea>')
  })

  it('passes style and data attributes to the textarea itself', () => {
    const out = tagOf(html({ style: { '--tc-ring-width': '4px' }, ...{ 'data-testid': 'field' } }))
    expect([attr(out, 'style'), attr(out, 'data-testid')]).toEqual(['--tc-ring-width:4px', 'field'])
  })
})

describe('the cap (R-5.7-8)', () => {
  it('is 5000 by default, the textarea entry of TEXT_MAX_LENGTH', () => {
    expect(on({}, 'maxLength')).toBe('5000')
  })

  it("takes the caller's number, and none at all for null", () => {
    expect(on({ maxLength: 500 }, 'maxLength')).toBe('500')
    expect(tagOf(html({ maxLength: null }))).not.toContain('maxLength')
  })
})

describe('with autosize or showCount, a holder around the same textarea', () => {
  it('is a div that holds the textarea and the counter after it, which the field names as its description', () => {
    const out = html({ showCount: true, defaultValue: 'Twelve chars', 'aria-describedby': 'hint' })
    expect(out).toMatch(/^<div class="[^"]*"><textarea [^>]*>Twelve chars<\/textarea><span id="[^"]+" class="[^"]*">/)
    const counter = /<span id="([^"]+)"/.exec(out)?.[1] ?? 'missing'
    expect(attr(tagOf(out), 'aria-describedby')).toBe(`hint ${counter}`)
  })

  it('counts on the server what the first client render will: 12 / 5,000', () => {
    expect(html({ showCount: true, defaultValue: 'Twelve chars' })).toContain('<span aria-hidden="true" dir="ltr">12 / 5,000</span><span class="sr-only">12 of 5,000 characters</span>')
  })

  it('gives the width to the holder, and fills it with the textarea', () => {
    const out = html({ autosize: true })
    expect(attr(out, 'class')).toContain('w-[min(100%,var(--tc-input-width))]')
    expect(classesOf({ autosize: true })).toContain('w-full')
    expect(attr(html({ autosize: true, fullWidth: true }), 'class')).toContain('w-full')
  })

  it('with no cap there is no counter, and the field keeps only the caller description', () => {
    const out = html({ showCount: true, maxLength: null, 'aria-describedby': 'hint' })
    expect(out).not.toContain('<span')
    expect(attr(tagOf(out), 'aria-describedby')).toBe('hint')
  })
})

describe('rows and maxRows are clamped (R-5.7-7)', () => {
  it('rows 99 becomes 40, 0 becomes 1, and 2.6 becomes 3', () => {
    expect([on({ rows: 99 }, 'rows'), on({ rows: 0 }, 'rows'), on({ rows: 2.6 }, 'rows')]).toEqual(['40', '1', '3'])
  })

  it('with autosize the server counts the line breaks, between rows and maxRows', () => {
    expect(on({ autosize: true, defaultValue: 'a' }, 'rows')).toBe('3')
    expect(on({ autosize: true, defaultValue: 'a\nb\nc\nd' }, 'rows')).toBe('4')
    expect(on({ autosize: true, defaultValue: 'a\n'.repeat(20) }, 'rows')).toBe('6')
    expect(on({ autosize: true, value: 'a\nb\nc\nd\ne', onChange: () => undefined }, 'rows')).toBe('5')
  })

  it('maxRows is never under rows, and never over 40', () => {
    expect(on({ autosize: true, rows: 5, maxRows: 2, defaultValue: 'a\n'.repeat(20) }, 'rows')).toBe('5')
    expect(on({ autosize: true, rows: 1, maxRows: 99, defaultValue: 'a\n'.repeat(60) }, 'rows')).toBe('40')
  })

  it('without autosize the line breaks change nothing', () => {
    expect(on({ defaultValue: 'a\n'.repeat(20) }, 'rows')).toBe('3')
  })
})

describe('invalid and the design props', () => {
  it('invalid sets aria-invalid and data-invalid; a caller aria-invalid survives when it is off', () => {
    expect([on({ invalid: true }, 'aria-invalid'), on({ invalid: true }, 'data-invalid')]).toEqual(['true', ''])
    expect(on({ 'aria-invalid': 'true' }, 'aria-invalid')).toBe('true')
    expect(on({}, 'aria-invalid')).toBeUndefined()
  })

  it('has its own width, or fills its container with fullWidth', () => {
    expect(classesOf()).toContain('w-[min(100%,var(--tc-input-width))]')
    expect(classesOf({ fullWidth: true })).toContain('w-full')
    expect(classesOf({ fullWidth: true })).not.toContain('w-[min(100%,var(--tc-input-width))]')
  })

  it('takes a handle that resizes it in the block direction, and none with autosize', () => {
    expect(classesOf()).toContain('resize-y')
    expect(classesOf({ autosize: true })).toContain('resize-none')
    expect(classesOf({ autosize: true })).not.toContain('resize-y')
  })

  it('a read-only field takes the read-only fill, from the prop', () => {
    expect(classesOf({ readOnly: true })).toContain('bg-neutral-soft')
    expect(classesOf({ readOnly: true })).not.toContain('bg-surface-raised')
    expect(on({ readOnly: true }, 'readOnly')).toBe('')
  })

  it("merges the caller's className last", () => {
    expect(classesOf({ className: 'rounded-none' }).at(-1)).toBe('rounded-none')
  })
})

describe('the classes each guarantee rests on, written out', () => {
  const COARSE = 'pointer-coarse:text-[max(1rem,16px)]'

  it('a block box, so no baseline gap sits under it, with the field look of Input', () => {
    expect(classesOf().slice(0, 2)).toEqual(['block', 'rounded-control'])
    expect(classesOf()).toEqual(expect.arrayContaining(['border-line-strong', 'aria-invalid:border-danger-solid', 'focus-visible:outline-solid', 'min-h-[var(--tc-target-min,24px)]']))
  })

  it('16 px text under a finger at every size, lg and xl too: text-base is 14 px under a 14 px root', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) expect(classesOf({ size }), size).toContain(COARSE)
    expect(classesOf({ size: 'custom' })).not.toContain(COARSE)
  })

  it('the block padding of each size', () => {
    expect((['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => classesOf({ size }).find((cls) => cls.startsWith('py-')))).toEqual(['py-1.5', 'py-1.5', 'py-2.5', 'py-3', 'py-4'])
  })

  it('the holder is one grid column with its type step, the touch floor of lg and xl included; the counter sits at its inline end, hidden while empty', () => {
    const out = html({ autosize: true, size: 'lg' })
    expect(attr(out, 'class')?.split(' ')).toEqual(['grid', 'max-w-full', 'gap-1.5', 'text-base', COARSE, 'w-[min(100%,var(--tc-input-width))]'])
    const counter = /<span id="[^"]+" class="([^"]*)"/.exec(out)?.[1]?.split(' ')
    expect(counter).toEqual(expect.arrayContaining(['justify-self-end', 'empty:hidden', 'data-at-limit:font-semibold', 'data-over-limit:text-danger-on-soft']))
  })

  it('the skeleton keeps the field floor, so one row under a finger is 44 px as the field is', () => {
    const skeleton = (attr(markup(<TextareaSkeleton rows={1} />), 'class') ?? '').split(' ')
    expect(skeleton).toEqual(expect.arrayContaining(['whitespace-pre', 'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']))
  })
})

describe('TextareaSkeleton', () => {
  it('is one hidden span holding a no-break space per row', () => {
    const out = markup(<TextareaSkeleton />)
    expect(out).toMatch(/^<span [^>]*aria-hidden="true">(\xa0)\n(\xa0)\n(\xa0)<\/span>$/)
  })

  it('clamps its rows as the field does, and takes the field width', () => {
    expect(markup(<TextareaSkeleton rows={99} />).split('\n')).toHaveLength(40)
    expect(attr(markup(<TextareaSkeleton fullWidth />), 'class')).toContain('w-full')
    expect(attr(markup(<TextareaSkeleton />), 'class')).toContain('w-[min(100%,var(--tc-input-width))]')
  })
})
