import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { attr, markup } from '#test/markup.js'
import { FileUpload } from '../index.js'

// The server HTML: what a page has before any script, and what the shared static specs measure.
const inputOf = (html: string) => /<input [^>]*>/.exec(html)?.[0] ?? ''
const idsIn = (html: string) => [...html.matchAll(/ id="([^"]*)"/g)].map((match) => match[1])

describe('the native input carries the form props', () => {
  const html = markup(<FileUpload id="docs" name="docs" accept=".pdf" required form="f">PDF only</FileUpload>)
  const input = inputOf(html)

  it('is a file input with its name, accept, required, form and id', () => {
    expect(attr(input, 'type')).toBe('file')
    expect(attr(input, 'name')).toBe('docs')
    expect(attr(input, 'accept')).toBe('.pdf')
    expect(attr(input, 'form')).toBe('f')
    expect(attr(input, 'id')).toBe('docs')
    expect(input).toContain(' required=""')
  })

  it('is described by the hint inside the zone, whose id resolves', () => {
    const hint = attr(input, 'aria-describedby') ?? ''
    expect(hint).toMatch(/-hint$/)
    expect(html).toContain(`<span id="${hint}" class="`)
    expect(html).toMatch(new RegExp(`id="${hint}"[^>]*>PDF only</span>`))
  })

  it('carries an empty title, so Chromium shows no "No file chosen" tooltip of its own over the zone; a caller\'s title wins', () => {
    expect(attr(input, 'title')).toBe('')
    expect(attr(inputOf(markup(<FileUpload aria-label="Docs" title="Pick the files" />)), 'title')).toBe('Pick the files')
  })

  it('is the last child of the zone, after the icon, the prompt and the hint', () => {
    expect(html).toMatch(/<div class="group\/zone [^"]*"><span aria-hidden="true"[^>]*>.*<\/span><span class="flex flex-wrap[^"]*"><span class="[^"]*">Drag files here or<\/span><span class="[^"]*">browse<\/span><\/span><span id="[^"]*"[^>]*>PDF only<\/span><input [^>]*><\/div>/)
  })
})

describe('multiple follows maxFiles alone', () => {
  const multiple = (maxFiles?: number) => inputOf(markup(<FileUpload aria-label="Files" maxFiles={maxFiles} />)).includes(' multiple=""')

  it('is off at the default of 1 and on above it', () => {
    expect([multiple(), multiple(1), multiple(2), multiple(5)]).toEqual([false, false, true, true])
  })

  it('a maxFiles under 1 is clamped to 1, and one over 100 to 100: still multiple', () => {
    expect([multiple(0), multiple(-4), multiple(Number.NaN), multiple(1000)]).toEqual([false, false, false, true])
  })
})

describe('aria-describedby lists only what is rendered', () => {
  const described = (element: Parameters<typeof markup>[0]) => attr(inputOf(markup(element)), 'aria-describedby')

  it('nothing with no hint and no caller ids', () => {
    expect(described(<FileUpload aria-label="Files" />)).toBeUndefined()
    expect(described(<FileUpload aria-label="Files">{''}</FileUpload>)).toBeUndefined()
  })

  it("the caller's ids alone with no hint, and after the hint with one", () => {
    expect(described(<FileUpload aria-label="Files" aria-describedby="a b" />)).toBe('a b')
    expect(described(<FileUpload aria-label="Files" aria-describedby="a b">Hint</FileUpload>)).toMatch(/^\S+-hint a b$/)
  })
})

describe('the root, the zone and the list', () => {
  const html = markup(<FileUpload aria-label="Files" className="mt-4" style={{ maxWidth: 200 }} data-probe="x" title="t">Hint</FileUpload>)

  it('className and style reach the root; every other prop reaches the input', () => {
    expect(html).toMatch(/^<div style="max-width:200px" class="relative grid [^"]* mt-4">/)
    expect(inputOf(html)).toContain('data-probe="x"')
    expect(inputOf(html)).toContain('title="t"')
    expect(inputOf(html)).toContain('aria-label="Files"')
  })

  it('the list is an empty list with its role written, and two empty status lines follow it', () => {
    expect(html).toMatch(/<ul role="list" class="[^"]*"><\/ul><div role="status" class="[^"]*"><\/div><div role="status" class="sr-only"><\/div><\/div>$/)
  })

  it('writes no --tc-list-rows while visibleRows is left out, and the clamped number when it is passed', () => {
    expect(html).toContain('<ul role="list" class="')
    expect(markup(<FileUpload aria-label="Files" visibleRows={3} />)).toContain('<ul role="list" style="--tc-list-rows:3"')
    expect(markup(<FileUpload aria-label="Files" visibleRows={500} />)).toContain('style="--tc-list-rows:20"')
    expect(markup(<FileUpload aria-label="Files" visibleRows={0} />)).toContain('style="--tc-list-rows:1"')
  })

  it('no id is written twice, two uploads on one page included', () => {
    const ids = idsIn(markup(<><FileUpload aria-label="A">Hint</FileUpload><FileUpload aria-label="B">Hint</FileUpload></>))
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })
})

describe('invalid and disabled', () => {
  it('invalid sets aria-invalid on the input; off, a Field\'s own aria-invalid survives', () => {
    expect(attr(inputOf(markup(<FileUpload aria-label="F" invalid />)), 'aria-invalid')).toBe('true')
    expect(attr(inputOf(markup(<FileUpload aria-label="F" aria-invalid />)), 'aria-invalid')).toBe('true')
    expect(attr(inputOf(markup(<FileUpload aria-label="F" />)), 'aria-invalid')).toBeUndefined()
  })

  it('disabled disables the input and marks the zone', () => {
    const html = markup(<FileUpload aria-label="F" disabled />)
    expect(inputOf(html)).toContain(' disabled=""')
    expect(html).toMatch(/<div data-disabled="" class="group\/zone /)
    expect(markup(<FileUpload aria-label="F" />)).not.toContain('data-disabled=""')
  })
})

describe('the words come from the labels', () => {
  it('in Arabic under the provider', () => {
    const html = markup(<TopClassProvider direction="rtl" locale="ar"><FileUpload aria-label="ملفات" /></TopClassProvider>)
    expect(html).toMatch(/<span class="[^"]*">اسحب الملفات إلى هنا أو<\/span>/)
    expect(html).toMatch(/<span class="[^"]*">تصفّح<\/span>/)
  })
})

describe('the compact zone and a drag drawn at rest', () => {
  it('compact marks the zone, draws the 18 px icon and hides the drop words, so browse is the prompt alone', () => {
    const html = markup(<FileUpload aria-label="F" compact />)
    expect(html).toMatch(/<div data-compact="" class="group\/zone /)
    expect(html).toContain('width="1.125rem"')
    expect(html).toMatch(/<span class="group-data-compact\/zone:hidden">Drag files here or<\/span>/)
    expect(markup(<FileUpload aria-label="F" />)).not.toContain('data-compact=""')
    expect(markup(<FileUpload aria-label="F" />)).toContain('width="1.625rem"')
  })

  it('data-dragging draws the zone as a drag over it, on the zone and never on the input', () => {
    const html = markup(<FileUpload aria-label="F" data-dragging />)
    expect(html).toMatch(/<div data-dragging="" class="group\/zone /)
    expect(inputOf(html)).not.toContain('data-dragging=')
    expect(markup(<FileUpload aria-label="F" data-dragging={false} />)).not.toContain('data-dragging=""')
  })
})
