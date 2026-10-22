import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { getLabels } from '#shared/labels/get-labels.js'
import { CodeBlock } from '../index.js'
import type { CodeBlockProps } from '../types.js'

const CODE = 'export function Page() {\n  return <p>Hi</p>\n}'

const html = (props: Partial<CodeBlockProps> = {}) => markup(<CodeBlock {...props}>{props.children ?? CODE}</CodeBlock>)
const preOf = (source: string) => /<pre [^>]*>/.exec(source)?.[0] ?? ''
const buttonOf = (source: string) => /<button [^>]*>/.exec(source)?.[0] ?? ''

describe('the code', () => {
  it('sits in a pre written left to right and kept from translation, in any page', () => {
    expect(attr(preOf(html()), 'dir')).toBe('ltr')
    expect(attr(preOf(html()), 'translate')).toBe('no')
    expect(attr(preOf(html({ dir: 'rtl' })), 'dir')).toBe('ltr')
  })

  it('keeps every space and line break, escaped once, inside one code element', () => {
    expect(html()).toContain('<code>export function Page() {\n  return &lt;p&gt;Hi&lt;/p&gt;\n}</code>')
  })

  it('writes lang as data-lang on the root and nowhere else, never as a class or the HTML lang', () => {
    const out = html({ lang: 'tsx' })
    expect(out).toMatch(/^<div data-lang="tsx" class="/)
    expect(out).not.toMatch(/ lang="/)
    expect(out.match(/tsx/g)).toHaveLength(1)
  })

  it('renders highlighted nodes in place of the text', () => {
    const out = html({ highlighted: <span className="font-semibold">export</span> })
    expect(out).toContain('<code><span class="font-semibold">export</span></code>')
    expect(out).not.toContain('function Page')
  })

  it('falls back to the text when highlighted holds nothing', () => {
    for (const highlighted of [null, false, '']) expect(html({ highlighted })).toContain('<code>export function Page()')
  })
})

describe('the tab stop and the region', () => {
  it('is a tab stop unless wrap, since the server cannot know whether a line overflows', () => {
    expect(attr(preOf(html()), 'tabindex')).toBe('0')
    expect(attr(preOf(html({ showCopy: false })), 'tabindex')).toBe('0')
    expect(attr(preOf(html({ wrap: true })), 'tabindex')).toBeUndefined()
  })

  it('with a title is a region named by the title, through the title id', () => {
    const out = html({ title: 'page.tsx' })
    const id = /<span dir="auto" id="([^"]+)"[^>]*>page\.tsx<\/span>/.exec(out)?.[1]
    expect(id).toBeTruthy()
    expect(attr(preOf(out), 'role')).toBe('region')
    expect(attr(preOf(out), 'aria-labelledby')).toBe(id)
  })

  it('without a title is still a region, named Code from labels, so its tab stop is never nameless', () => {
    for (const title of [undefined, null, false, '']) {
      for (const showCopy of [true, false]) {
        const pre = preOf(html({ title, showCopy }))
        expect([attr(pre, 'role'), attr(pre, 'aria-label'), attr(pre, 'aria-labelledby')], `${String(title)} ${String(showCopy)}`).toEqual(['region', 'Code', undefined])
      }
    }
    expect(attr(preOf(html({ ...getLabels('ar') })), 'aria-label')).toBe('الشيفرة البرمجية')
  })

  it('with a title is named by it alone, never by the Code label too', () => {
    expect(attr(preOf(html({ title: 'page.tsx' })), 'aria-label')).toBeUndefined()
  })

  it('with wrap and no title is no tab stop, so it is no region and names nothing', () => {
    const pre = preOf(html({ wrap: true }))
    expect([attr(pre, 'tabindex'), attr(pre, 'role'), attr(pre, 'aria-label'), attr(pre, 'aria-labelledby')]).toEqual([undefined, undefined, undefined, undefined])
  })
})

describe('the header', () => {
  it('holds the hidden terminal icon, the title, then the button', () => {
    const out = html({ title: 'page.tsx' })
    expect(out).toMatch(/<span aria-hidden="true" class="[^"]*"><svg width="0.875rem" height="0.875rem" [^>]*aria-hidden="true"/)
    expect(out.indexOf('page.tsx</span>')).toBeLessThan(out.indexOf('<button'))
  })

  it('icon={null} draws no icon, and the title still names the block', () => {
    const out = html({ title: 'page.tsx', icon: null })
    expect(out).not.toContain('<span aria-hidden="true"')
    expect(out).toContain('page.tsx</span>')
  })

  it('draws the icon it is given in place of the terminal, hidden, before the title', () => {
    const out = html({ title: 'page.tsx', icon: <i data-probe="" /> })
    expect(out).toMatch(/<span aria-hidden="true" class="[^"]*"><i data-probe=""><\/i><\/span>/)
    expect(out.match(/<svg/g), 'the copy button\'s icon alone').toHaveLength(1)
    expect(out.indexOf('data-probe')).toBeLessThan(out.indexOf('page.tsx</span>'))
  })

  it('without a title holds the button alone, and no icon', () => {
    const out = html()
    expect(out).toContain('<button')
    expect(out).not.toContain('<span aria-hidden="true"')
  })

  it('showCopy={false} renders no button, and no header without a title', () => {
    const out = html({ showCopy: false })
    expect(out).not.toContain('<button')
    expect(out).not.toContain('role="status"')
    expect(out.match(/<div/g)).toHaveLength(1)
    expect(html({ showCopy: false, title: 'page.tsx' }).match(/<div/g)).toHaveLength(2)
  })
})

describe('the copy button in the server HTML', () => {
  it('with a title is named "Copy page.tsx": its own label, then the title', () => {
    const out = html({ title: 'page.tsx' })
    const button = buttonOf(out)
    const titleId = /<span dir="auto" id="([^"]+)"/.exec(out)?.[1] ?? 'none'
    const own = attr(button, 'id') ?? 'none'
    expect(attr(button, 'type')).toBe('button')
    expect(attr(button, 'aria-label')).toBe('Copy')
    expect(attr(button, 'aria-labelledby')).toBe(`${own} ${titleId}`)
    expect(own).not.toBe(titleId)
  })

  it('without a title is named "Copy" alone', () => {
    const button = buttonOf(html())
    expect(attr(button, 'aria-label')).toBe('Copy')
    expect(attr(button, 'aria-labelledby')).toBeUndefined()
  })

  it('holds the copy icon, at rest and not copied, and an empty polite status beside it, its words in a node of their own', () => {
    const out = html()
    expect(attr(buttonOf(out), 'data-copied')).toBeUndefined()
    expect(out).toContain('<span role="status" class="sr-only"><span></span></span>')
  })

  it('takes its name from labels, so a server page in Arabic needs no provider', () => {
    expect(attr(buttonOf(html({ ...getLabels('ar') })), 'aria-label')).toBe('نسخ')
  })

  it('two blocks on one page give two buttons two ids and two titles two ids', () => {
    const out = markup(<><CodeBlock title="a.ts">a</CodeBlock><CodeBlock title="b.ts">b</CodeBlock></>)
    const ids = [...out.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id)
    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
  })
})

describe('the rest props', () => {
  it('reach the root, and className is merged last', () => {
    const out = html({ id: 'snippet', 'aria-describedby': 'hint', className: 'mt-4' })
    expect(attr(out, 'id')).toBe('snippet')
    expect(attr(out, 'aria-describedby')).toBe('hint')
    expect(attr(out, 'class')?.split(' ').at(-1)).toBe('mt-4')
  })

  it('never write labels or locale onto the element', () => {
    const out = html({ ...getLabels('ar') })
    expect(out).not.toMatch(/ (labels|locale)="/)
  })
})
