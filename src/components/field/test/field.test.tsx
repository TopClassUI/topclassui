import { describe, expect, it } from 'vitest'

import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'
import { attr, markup } from '#test/markup.js'
import { Field } from '../index.js'
import type { FieldProps } from '../types.js'

type Props = Omit<FieldProps, 'children' | 'name' | 'label'> & Partial<Pick<FieldProps, 'name' | 'label'>>

const field = (props: Props = {}) => markup(
  <Field name="email" label="Email" {...props}>{(control) => <Input {...control} type="email" />}</Field>,
)
/** The opening tag of the first element of a kind, wherever it sits in the markup. */
const tag = (html: string, name: string) => new RegExp(`<${name}\\b[^>]*>`).exec(html)?.[0] ?? ''
const ids = (html: string) => [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id)
const byId = (html: string, id: string) => new RegExp(`<[a-z]+ id="${id.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}"[^>]*>(.*?)</div>`).exec(html)?.[1]

describe('the label names the control in the server HTML (R-5.6-1)', () => {
  it("points the label's for at the control's id, and the control's aria-labelledby at the label", () => {
    const html = field({ id: 'email' })
    expect([attr(tag(html, 'label'), 'id'), attr(tag(html, 'label'), 'for')]).toEqual(['email-label', 'email'])
    expect([attr(tag(html, 'input'), 'id'), attr(tag(html, 'input'), 'aria-labelledby'), attr(tag(html, 'input'), 'name')])
      .toEqual(['email', 'email-label', 'email'])
  })

  it('takes every id from useId when no id is given, never from the name', () => {
    const html = field()
    const control = attr(tag(html, 'input'), 'id') ?? ''
    expect(control).not.toContain('email')
    expect(control.length).toBeGreaterThan(2)
    expect(attr(tag(html, 'label'), 'for')).toBe(control)
    expect(attr(tag(html, 'label'), 'id')).toBe(`${control}-label`)
  })

  it('the ids follow the id when it is given: label, hint and error', () => {
    const html = field({ id: 'mail', hint: 'We never share it', error: 'Taken' })
    expect(ids(html)).toEqual(['mail-label', 'mail', 'mail-hint', 'mail-err'])
  })
})

describe('two Fields of one name (choice 33)', () => {
  const html = markup(
    <form>
      <Field name="contact" label="Email me" hint="Weekly">{(control) => <Input {...control} type="checkbox" value="email" />}</Field>
      <Field name="contact" label="Text me" hint="Daily">{(control) => <Input {...control} type="checkbox" value="sms" />}</Field>
    </form>,
  )
  const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([found]) => found)
  const labels = [...html.matchAll(/<label\b[^>]*>/g)].map(([found]) => found)

  it('write no id twice', () => {
    const all = ids(html)
    expect(all).toHaveLength(6)
    expect(new Set(all).size).toBe(6)
  })

  it("point each label's for at its own control, and each control's description at its own hint", () => {
    expect(labels.map((label) => attr(label, 'for'))).toEqual(inputs.map((input) => attr(input, 'id')))
    expect(inputs.map((input) => byId(html, attr(input, 'aria-describedby') ?? ''))).toEqual(['Weekly', 'Daily'])
  })

  it('give both controls the one name a form sends', () => {
    expect(inputs.map((input) => attr(input, 'name'))).toEqual(['contact', 'contact'])
  })
})

describe('the description', () => {
  it('lists the hint and then the error, and nothing that is not rendered', () => {
    const describedBy = (props: Props) => attr(tag(field({ id: 'e', ...props }), 'input'), 'aria-describedby')
    expect(describedBy({})).toBeUndefined()
    expect(describedBy({ hint: 'H' })).toBe('e-hint')
    expect(describedBy({ error: 'E' })).toBe('e-err')
    expect(describedBy({ hint: 'H', error: 'E' })).toBe('e-hint e-err')
    expect(describedBy({ hint: '', error: [] })).toBeUndefined()
    expect(describedBy({ hint: false, error: '' })).toBeUndefined()
  })

  it('every id it names is on an element of the HTML', () => {
    const html = field({ id: 'e', hint: 'H', error: ['One', 'Two'] })
    for (const id of (attr(tag(html, 'input'), 'aria-describedby') ?? '').split(' ')) expect(ids(html), id).toContain(id)
  })

  it('the hint and the error are divs, so a block inside them survives the parser', () => {
    const html = field({ id: 'e', hint: 'H', error: 'E' })
    expect(html).toContain('<div id="e-hint" class="')
    expect(html).toContain('<div id="e-err" class="')
  })

  it('writes each message of an array in a div of its own, after a hidden icon', () => {
    const html = field({ id: 'e', error: ['Too short', 'No digits'] })
    expect(html).toMatch(/<div id="e-err" [^>]*><span aria-hidden="true" [^>]*><svg [^>]*aria-hidden="true"[^>]*>.*?<\/svg><\/span><div><div>Too short<\/div><div>No digits<\/div><\/div><\/div>/)
  })
})

describe('invalid', () => {
  it('is aria-invalid="true" on the control with an error, and absent without one', () => {
    expect(attr(tag(field({ error: 'Taken' }), 'input'), 'aria-invalid')).toBe('true')
    expect(attr(tag(field(), 'input'), 'aria-invalid')).toBeUndefined()
    expect(attr(tag(field({ error: ['', ' '] }), 'input'), 'aria-invalid')).toBeUndefined()
  })

  it('follows invalid when it is given, either way', () => {
    expect(attr(tag(field({ invalid: true }), 'input'), 'aria-invalid')).toBe('true')
    expect(attr(tag(field({ error: 'Taken', invalid: false }), 'input'), 'aria-invalid')).toBeUndefined()
  })
})

describe('required', () => {
  it('reaches the control and draws an asterisk that is hidden from the accessibility tree', () => {
    const html = field({ required: true })
    expect(attr(tag(html, 'input'), 'required')).toBe('')
    expect(html).toMatch(/<label [^>]*>Email<span aria-hidden="true" class="[^"]*"><svg [^>]*><path [^>]*><\/path><\/svg><\/span><\/label>/)
  })

  it('is off by default: no attribute and no asterisk', () => {
    const html = field()
    expect(attr(tag(html, 'input'), 'required')).toBeUndefined()
    expect(tag(html, 'label')).not.toContain('aria-hidden')
    expect(html).not.toContain('<span aria-hidden')
  })

  it('a Checkbox and a RadioGroupRoot say it with aria-required, which a screen reader hears', () => {
    const box = markup(<Field name="terms" label="Terms" required inline>{(control) => <Checkbox {...control} />}</Field>)
    expect(attr(tag(box, 'button'), 'aria-required')).toBe('true')
    const group = markup(
      <Field name="plan" label="Plan" required>
        {(control) => <RadioGroupRoot {...control}><RadioGroupItem value="a">A</RadioGroupItem></RadioGroupRoot>}
      </Field>,
    )
    expect(attr(/<div [^>]*role="radiogroup"[^>]*>/.exec(group)?.[0] ?? '', 'aria-required')).toBe('true')
  })
})

describe('the root', () => {
  it('takes className last, style, data attributes and the rest; the id goes to the control, not the root', () => {
    const html = field({ id: 'e', className: 'mt-4', style: { '--tc-ring-width': '4px' }, ...{ 'data-testid': 'f', title: 'T' } })
    const root = tag(html, 'div')
    expect(attr(root, 'class')?.endsWith(' mt-4')).toBe(true)
    expect([attr(root, 'style'), attr(root, 'data-testid'), attr(root, 'title'), attr(root, 'id')]).toEqual(['--tc-ring-width:4px', 'f', 'T', undefined])
  })

  it('renders the label first in the HTML, inline too, so the reading order is label then control', () => {
    for (const inline of [false, true]) expect(field({ inline }), String(inline)).toMatch(/^<div [^>]*><label /)
  })

  it('calls the child once, with the control object', () => {
    const seen: unknown[] = []
    markup(<Field name="n" label="L" id="i" hint="H" required>{(control) => { seen.push(control); return null }}</Field>)
    expect(seen).toEqual([{ id: 'i', name: 'n', required: true, 'aria-labelledby': 'i-label', 'aria-describedby': 'i-hint', 'aria-invalid': undefined }])
  })
})
