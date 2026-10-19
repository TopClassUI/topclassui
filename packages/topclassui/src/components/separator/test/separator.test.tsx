import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { Separator } from '../index.js'
import type { SeparatorProps } from '../types.js'

const html = (props: SeparatorProps = {}) => markup(<Separator {...props} />)

/** The Build this role table, one row per cell, written out rather than derived. */
const ROLE = [
  { orientation: 'horizontal', decorative: true, role: 'none', aria: undefined },
  { orientation: 'vertical', decorative: true, role: 'none', aria: undefined },
  { orientation: 'horizontal', decorative: false, role: 'separator', aria: 'horizontal' },
  { orientation: 'vertical', decorative: false, role: 'separator', aria: 'vertical' },
] as const

describe('the element it renders', () => {
  it('is an empty div, because the labelled form is not built', () => {
    expect(html()).toMatch(/^<div [^>]*><\/div>$/)
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Separator id="rule" data-testid="x" title="Section break" />)
    expect(attr(html_, 'id')).toBe('rule')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'title')).toBe('Section break')
  })

  it('passes style through to the root', () => {
    expect(attr(html({ style: { opacity: 0.5 } }), 'style')).toBe('opacity:0.5')
  })
})

describe('the role follows decorative, and aria-orientation only a real separator', () => {
  for (const cell of ROLE) {
    const name = `${cell.orientation}, decorative ${String(cell.decorative)}`

    it(`${name} is role="${cell.role}"`, () => {
      const html_ = html({ orientation: cell.orientation, decorative: cell.decorative })
      expect(attr(html_, 'role')).toBe(cell.role)
    })

    it(`${name} ${cell.aria ? `reports aria-orientation="${cell.aria}"` : 'carries no aria-orientation'}`, () => {
      const html_ = html({ orientation: cell.orientation, decorative: cell.decorative })
      expect(attr(html_, 'aria-orientation')).toBe(cell.aria)
    })
  }

  it('is decorative by default, as the frame description and the playground have it', () => {
    expect(attr(html(), 'role')).toBe('none')
    expect(html()).not.toContain('aria-orientation')
  })

  it('reports the default orientation to a screen reader once it is not decorative', () => {
    expect(attr(html({ decorative: false }), 'aria-orientation')).toBe('horizontal')
  })

  it('treats decorative={undefined} as the default, not as false', () => {
    expect(attr(html({ decorative: undefined }), 'role')).toBe('none')
  })

  it('never hides itself with aria-hidden, which role none makes redundant', () => {
    expect(html()).not.toContain('aria-hidden')
    expect(html({ decorative: false })).not.toContain('aria-hidden')
  })

  it('keeps the role and aria-orientation it decided, whatever a JS caller passes', () => {
    const forced = { decorative: true, role: 'separator', 'aria-orientation': 'vertical' } as SeparatorProps
    const html_ = html(forced)
    expect(attr(html_, 'role')).toBe('none')
    expect(html_).not.toContain('aria-orientation')

    const semantic = { decorative: false, role: 'presentation' } as SeparatorProps
    expect(attr(html(semantic), 'role')).toBe('separator')
  })
})

describe('the design attributes', () => {
  it('reports the orientation on data-orientation, decorative or not', () => {
    expect(attr(html(), 'data-orientation')).toBe('horizontal')
    expect(attr(html({ orientation: 'vertical' }), 'data-orientation')).toBe('vertical')
    expect(attr(html({ orientation: 'vertical', decorative: false }), 'data-orientation')).toBe('vertical')
  })

  it('carries data-orientation and no other data attribute of its own', () => {
    expect(html({ orientation: 'vertical', decorative: false }).match(/data-[a-z-]+/g)).toEqual(['data-orientation'])
  })

  it('carries no state attribute, because a separator has no states', () => {
    expect(html()).not.toMatch(/data-(state|disabled|loading|open|decorative)/)
  })
})

describe('the labelled form, as Figma 137:815 draws it', () => {
  it('puts the label between two lines that carry the hairline', () => {
    const html = markup(<Separator>or</Separator>)
    expect(html).toMatch(/<span aria-hidden="true" class="flex-1 border-t-\(length:--tc-line-width\) border-line"><\/span><span id="[^"]+">or<\/span><span aria-hidden="true" class="flex-1 border-t-/)
  })

  it('moves the line off the root, which becomes the row', () => {
    const list = classList(markup(<Separator>or</Separator>))
    expect(list).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-2.5', 'text-xs', 'text-muted']))
    expect(list).not.toContain('border-line')
  })

  it('names an announced separator by its label', () => {
    const html = markup(<Separator decorative={false}>or</Separator>)
    expect(attr(html, 'aria-labelledby')).toBe(/id="([^"]+)">or</.exec(html)?.[1])
  })

  it('names a decorative one by nothing, since the label is read as text', () => {
    expect(markup(<Separator>or</Separator>)).not.toContain('aria-labelledby')
  })
})
