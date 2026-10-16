import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField, type OtpFieldProps } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
const html = (props: Partial<OtpFieldProps> = {}) => markup(<OTPField id="code" {...props as OtpFieldProps} />)
const root = (out: string) => /^<div [^>]*>/.exec(out)?.[0] ?? ''
/** The visible cells: every input inside the group. */
const cells = (out: string) => [...(/^<div [^>]*>([\s\S]*)<\/div>/.exec(out)?.[1] ?? '').matchAll(/<input [^>]*>/g)].map(([cell]) => cell)
/** Base UI's hidden input, served after the group. */
const hidden = (out: string) => /<\/div>(<input [^>]*>)$/.exec(out)?.[1] ?? ''
const each = (out: string, name: string) => cells(out).map((cell) => attr(cell, name))

describe('on the server', () => {
  it('the root is a group, left to right, with its size, holding six cells by default', () => {
    const out = html()
    expect(root(out)).toMatch(/^<div role="group" dir="ltr" data-size="md" class="flex w-fit /)
    expect(cells(out)).toHaveLength(6)
    expect(each(out, 'id')).toEqual(['code', 'code-2', 'code-3', 'code-4', 'code-5', 'code-6'])
  })

  it('length is clamped to a whole number between 1 and 12 (R-5.7-7)', () => {
    expect(cells(html({ length: 99 }))).toHaveLength(12)
    expect(cells(html({ length: 0 }))).toHaveLength(1)
    expect(cells(html({ length: -3 }))).toHaveLength(1)
    expect(cells(html({ length: 4.7 }))).toHaveLength(4)
    expect(cells(html({ length: Number.NaN }))).toHaveLength(1)
  })

  it('one tab stop: the first empty cell, or the last when the code is whole', () => {
    expect(each(html(), 'tabindex')).toEqual(['0', '-1', '-1', '-1', '-1', '-1'])
    expect(each(html({ defaultValue: '12' }), 'tabindex')).toEqual(['-1', '-1', '0', '-1', '-1', '-1'])
    expect(each(html({ length: 3, defaultValue: '123' }), 'tabindex')).toEqual(['-1', '-1', '0'])
  })

  it('the first cell takes the name; every later cell is named by its place', () => {
    expect(each(html(), 'aria-label')).toEqual([
      undefined, 'Character 2 of 6', 'Character 3 of 6', 'Character 4 of 6', 'Character 5 of 6', 'Character 6 of 6',
    ])
  })

  it('the names of cells two to six come from the Arabic labels under an Arabic provider', () => {
    const out = markup(<TopClassProvider direction="rtl" locale="ar"><OTPField id="code" /></TopClassProvider>)
    expect(each(out.replace(/^<div class="isolate">/, '').replace(/<\/div>$/, ''), 'aria-label')).toEqual([
      undefined, 'الخانة 2 من 6', 'الخانة 3 من 6', 'الخانة 4 من 6', 'الخانة 5 من 6', 'الخانة 6 من 6',
    ])
  })

  it('the caller aria-labelledby is on the first cell and on the group, so a tab stop on a later cell is in a named group', () => {
    const out = markup(<OTPField aria-labelledby="code-label" defaultValue="12" />)
    expect(each(out, 'aria-labelledby')).toEqual(['code-label', undefined, undefined, undefined, undefined, undefined])
    expect(attr(root(out), 'aria-labelledby')).toBe('code-label')
  })

  it('aria-describedby is on the first cell only', () => {
    const out = html({ 'aria-describedby': 'code-hint' })
    expect(each(out, 'aria-describedby')).toEqual(['code-hint', undefined, undefined, undefined, undefined, undefined])
    expect(root(out)).not.toContain('aria-describedby')
  })

  it('aria-invalid passed as a plain prop is on every cell and not on the group; invalid sets it too', () => {
    const plain = html({ 'aria-invalid': true })
    expect(each(plain, 'aria-invalid')).toEqual(['true', 'true', 'true', 'true', 'true', 'true'])
    expect(root(plain)).not.toContain('aria-invalid')
    expect(each(html({ invalid: true }), 'aria-invalid')).toEqual(['true', 'true', 'true', 'true', 'true', 'true'])
    expect(each(html(), 'aria-invalid')).toEqual([undefined, undefined, undefined, undefined, undefined, undefined])
  })

  it('every row may break; past eight items, separators counted, it breaks at whole cells, and up to eight at the 24 px floor', () => {
    const classes = (props: Partial<OtpFieldProps>) => {
      const out = html(props)
      const cell = (attr(cells(out)[0] ?? '', 'class') ?? '').split(' ')
      const fit = cell.includes('basis-[var(--tc-target-min,24px)]') && cell.includes('grow')
      const whole = cell.includes('w-full') && cell.includes('grow-0')
      return [(attr(root(out), 'class') ?? '').split(' ').includes('flex-wrap'), fit ? 'fit' : whole ? 'whole' : 'neither']
    }
    expect(classes({ length: 9 })).toEqual([true, 'whole'])
    expect(classes({ length: 8 })).toEqual([true, 'fit'])
    expect(classes({ length: 6, groupSize: 2 })).toEqual([true, 'fit'])
    expect(classes({ length: 8, groupSize: 4 })).toEqual([true, 'whole'])
  })

  it('groupSize draws an aria-hidden bar after every group but the last, and is clamped between 0 and length', () => {
    const order = (props: Partial<OtpFieldProps>) => [...html(props).matchAll(/<(input|span)[ >]/g)].map(([, tag]) => (tag === 'span' ? '|' : 'x')).join('')
    expect(order({ groupSize: 3 })).toBe('xxx|xxxx')
    expect(order({ groupSize: 2 })).toBe('xx|xx|xxx')
    expect(order({ groupSize: 6 })).toBe('xxxxxxx')
    expect(order({ groupSize: 99 })).toBe('xxxxxxx')
    expect(order({ groupSize: -1 })).toBe('xxxxxxx')
    expect(order({ groupSize: 2.9 })).toBe('xx|xx|xxx')
    expect(html({ groupSize: 3 })).toContain('<span aria-hidden="true" class="h-0.5 w-2.5 ')
  })

  it('numeric is ours: an inputmode of numeric, the one-time-code autocomplete, and no pattern (choice 21)', () => {
    const out = html({ name: 'code' })
    expect(each(out, 'inputMode')).toEqual(['numeric', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric'])
    expect(each(out, 'autoComplete')).toEqual(['one-time-code', 'off', 'off', 'off', 'off', 'off'])
    expect(attr(hidden(out), 'autoComplete')).toBe('one-time-code')
    expect(out).not.toContain('pattern=')
  })

  it('another validation type is Base UI\'s, with its pattern; a caller inputMode wins', () => {
    const out = html({ validationType: 'alpha' })
    expect(each(out, 'pattern')[0]).toBe('[a-zA-Z]{1}')
    expect(each(out, 'inputMode')[0]).toBe('text')
    expect(each(html({ inputMode: 'tel' }), 'inputMode')[0]).toBe('tel')
  })

  it('the hidden input carries the name and the default; one cell per character of it', () => {
    const out = html({ name: 'code', defaultValue: '4821' })
    expect([attr(hidden(out), 'name'), attr(hidden(out), 'value'), attr(hidden(out), 'aria-hidden'), attr(hidden(out), 'tabindex')])
      .toEqual(['code', '4821', 'true', '-1'])
    expect(each(out, 'value')).toEqual(['4', '8', '2', '1', '', ''])
  })

  it('an Arabic-Indic default is served as ASCII digits', () => {
    expect(attr(hidden(html({ name: 'code', defaultValue: '٤٨٢' })), 'value')).toBe('482')
  })

  it('size reaches the root as data-size and each cell as its square; custom draws no size', () => {
    expect(attr(root(html({ size: 'xl' })), 'data-size')).toBe('xl')
    expect(cells(html({ size: 'xl' }))[0]).toContain('h-control-xl max-w-control-xl text-2xl')
    expect(cells(html({ size: 'custom' }))[0]).not.toMatch(/h-control-|max-w-control-|text-(sm|base|lg|xl|2xl)/)
  })

  it('disabled, readOnly, required and form reach every cell and the hidden input', () => {
    const out = html({ name: 'code', disabled: true, readOnly: true, required: true, form: 'f' })
    for (const input of [...cells(out), hidden(out)]) {
      expect(input).toContain('disabled=""')
      expect(input).toContain('readOnly=""')
      expect(input).toContain('required=""')
      expect(attr(input, 'form')).toBe('f')
    }
  })

  it('the rest props, style and the caller className reach the group, the class last', () => {
    const out = root(html({ title: 'Code', style: { marginBlock: 4 }, className: 'gap-4' }))
    expect(out).toContain('title="Code"')
    expect(out).toContain('style="margin-block:4px"')
    expect(attr(out, 'class')?.endsWith(' gap-4')).toBe(true)
    expect(attr(out, 'class')).not.toContain('gap-2')
  })
})
