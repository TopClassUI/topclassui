import { describe, expect, it } from 'vitest'

import { bell } from '#icons/data/bell.js'
import { checkCircle } from '#icons/data/check-circle.js'
import { info } from '#icons/data/info.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { warning } from '#icons/data/warning.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { Alert } from '../index.js'
import type { AlertProps } from '../types.js'

const html = (props: AlertProps = {}) => markup(<Alert title="Saved" {...props}>Stored.</Alert>)
const svgTag = (source: string) => /<svg[^>]*>/.exec(source)?.[0] ?? ''
const drawn = (source: string) => [...source.matchAll(/<path d="([^"]*)"/g)].map((m) => m[1])

/** The Build this table: check-circle, warning and warning-circle, and info for the other three. */
const ICON: Record<string, string> = {
  primary: info.path,
  neutral: info.path,
  success: checkCircle.path,
  warning: warning.path,
  danger: warningCircle.path,
  info: info.path,
}

describe('the default icon follows the tone', () => {
  for (const [tone, path] of Object.entries(ICON)) {
    it(`${tone} draws the icon the table gives it, and only that one`, () => {
      expect(drawn(html({ tone: tone as AlertProps['tone'] })), tone).toEqual([path])
    })
  }

  it('gives the four drawn tones four different icons, so none reads by colour alone', () => {
    const paths = (['info', 'success', 'warning', 'danger'] as const).map((tone) => drawn(html({ tone }))[0])
    expect(new Set(paths).size).toBe(4)
  })

  it('keeps the icon whatever the variant, because the variant only repaints it', () => {
    for (const variant of ['soft', 'solid', 'outline'] as const) {
      expect(drawn(html({ variant, tone: 'success' })), variant).toEqual([checkCircle.path])
    }
  })

  it('falls back to the default icon for a tone no list holds, rather than throwing', () => {
    expect(drawn(html({ tone: 'brand' as never }))).toEqual([info.path])
    expect(drawn(html({ tone: 'constructor' as never }))).toEqual([info.path])
  })
})

describe('the default icon is the alert\'s own choice, not the Svg default', () => {
  it('is 16 px, size xs, where an Svg left alone would be 1em', () => {
    const svg = svgTag(html())
    expect(attr(svg, 'width')).toBe('16')
    expect(attr(svg, 'height')).toBe('16')
  })

  it('sits 2 px down, which centres it on the 20 px first line of the title', () => {
    expect(classList(svgTag(html())).sort()).toEqual(['inline-block', 'mt-0.5', 'shrink-0'])
  })

  it('has no label, because the title carries the meaning', () => {
    const svg = svgTag(html())
    expect(attr(svg, 'aria-hidden')).toBe('true')
    expect(svg).not.toContain('aria-label')
    expect(svg).not.toContain('role=')
  })

  it('comes first, before the text, so it sits at the start in either direction', () => {
    expect(html()).toMatch(/^<div [^>]*><svg /)
  })

  it('is aimed at by no class on the root or the body, so nothing overrides that size', () => {
    const root = classList(html())
    expect(root.filter((c) => /^(\*|\[&)|svg/.test(c))).toEqual([])
    const body = classList(/<div class="[^"]*"/.exec(html())?.[0] ?? '')
    expect(body.filter((c) => /^(\*|\[&)|svg/.test(c))).toEqual([])
  })
})

describe('the icon prop', () => {
  it('replaces the default with the caller\'s own node, as given', () => {
    const source = html({ icon: <Svg icon={bell} size="xs" />, tone: 'success' })
    expect(drawn(source)).toEqual([bell.path])
    expect(classList(svgTag(source)).sort()).toEqual(['inline-block', 'shrink-0'])
    expect(source).toMatch(/^<div [^>]*><svg [^>]*class="inline-block shrink-0"/)
  })

  it('hides the icon when null, which is what withIcon would have done', () => {
    const source = html({ icon: null })
    expect(source).not.toContain('<svg')
    expect(source).toMatch(/^<div [^>]*><div class=/)
  })

  it('hides it for false too, which a condition such as {flag && icon} passes', () => {
    expect(html({ icon: false })).not.toContain('<svg')
  })

  it('uses the default when the prop is left undefined, as a spread of optional props does', () => {
    expect(drawn(html({ icon: undefined, tone: 'danger' }))).toEqual([warningCircle.path])
  })
})
