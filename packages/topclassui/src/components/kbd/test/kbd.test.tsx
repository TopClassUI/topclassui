import { describe, expect, it } from 'vitest'

import { Svg } from '#components/svg/index.js'
import { command } from '#icons/data/command.js'
import { attr, classList, markup } from '#test/markup.js'
import { Kbd } from '../index.js'

/** The class attribute the spec gives, written out in the order cn() emits it. */
const CLASS = 'inline-flex items-center justify-center rounded-chip bg-surface px-1.5 py-0.5'
  + ' font-mono text-xs text-body border-(length:--tc-line-width) border-line-strong'

/** The text of every keycap in the markup, in document order. */
const keysIn = (html: string) =>
  [...html.matchAll(/<kbd class="[^"]*"[^>]*>([^<]*)<\/kbd>/g)].map((m) => m[1])

describe('the element it renders', () => {
  it('is a kbd from its opening tag to its closing tag, the element HTML gives a key', () => {
    const html = markup(<Kbd>K</Kbd>)
    expect(html).toMatch(/^<kbd /)
    expect(html).toMatch(/<\/kbd>$/)
    expect(html).not.toContain('<span')
  })

  it('has no role, because kbd already says what it is', () => {
    expect(markup(<Kbd>K</Kbd>)).not.toContain('role=')
  })

  it('renders its text as it is, with no wrapper of its own inside', () => {
    expect(markup(<Kbd>Shift</Kbd>)).toBe(`<kbd class="${CLASS}">Shift</kbd>`)
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html = markup(<Kbd id="save" data-testid="x" title="Control">Ctrl</Kbd>)
    expect(attr(html, 'id')).toBe('save')
    expect(attr(html, 'data-testid')).toBe('x')
    expect(attr(html, 'title')).toBe('Control')
    expect(keysIn(html)).toEqual(['Ctrl'])
  })

  it('passes style through to the root', () => {
    expect(attr(markup(<Kbd style={{ opacity: 0.5 }}>K</Kbd>), 'style')).toBe('opacity:0.5')
  })
})

describe('no design prop and no state', () => {
  it('carries no design or state attribute, because the spec builds neither', () => {
    expect(markup(<Kbd>K</Kbd>)).not.toMatch(/data-(variant|tone|size|state|pressed|muted|disabled|open|loading)/)
  })

  it('is not a control, so it carries no disabled, pressed or tab-stop attribute', () => {
    expect(markup(<Kbd>K</Kbd>)).not.toMatch(/(disabled|aria-pressed|tabindex)=/)
  })
})

describe('a combination', () => {
  it('is sibling keys with a space between, as the docs sample writes it', () => {
    const html = markup(<p><Kbd>Ctrl</Kbd> <Kbd>K</Kbd></p>)
    expect(keysIn(html)).toEqual(['Ctrl', 'K'])
    expect(html).toContain('</kbd> <kbd ')
  })

  it('adds no plus and no group element of its own between the keys', () => {
    const html = markup(<p><Kbd>Shift</Kbd><Kbd>Tab</Kbd></p>)
    expect(html).toBe(`<p><kbd class="${CLASS}">Shift</kbd><kbd class="${CLASS}">Tab</kbd></p>`)
  })

  it('nests in a plain outer kbd when the caller wants the form of the HTML spec', () => {
    const html = markup(<kbd><Kbd>Shift</Kbd><Kbd>Tab</Kbd></kbd>)
    expect(html).toMatch(/^<kbd><kbd class="/)
    expect(keysIn(html)).toEqual(['Shift', 'Tab'])
  })
})

describe('an icon inside a key', () => {
  const icon = <Svg icon={command} label="Command" />

  it('passes the Svg through untouched, so the key never resizes it', () => {
    expect(markup(<Kbd>{icon}</Kbd>)).toBe(`<kbd class="${CLASS}">${markup(icon)}</kbd>`)
  })

  it('aims no class at its children, which would beat the icon 1em attributes', () => {
    const list = classList(markup(<Kbd>{icon}</Kbd>))
    expect(list.filter((c) => /^(\*|\[&|has-|group)|svg/.test(c))).toEqual([])
  })
})
