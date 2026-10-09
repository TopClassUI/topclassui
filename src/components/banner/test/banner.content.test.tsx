import { describe, expect, it } from 'vitest'

import { bell } from '#icons/data/bell.js'
import { Svg } from '#components/svg/index.js'
import { markup } from '#test/markup.js'
import { Banner } from '../index.js'

const MESSAGE = '<div class="min-w-0 flex-1">'

/** Everything inside the root, exactly as rendered. */
const inner = (source: string) => source.replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '')

describe('the three slots, in reading order', () => {
  it('puts the icon first, the message second and the action last', () => {
    const source = markup(
      <Banner aria-label="Notice" icon={<i>icon</i>} action={<a href="/more">Read more</a>}>Version 2 is out.</Banner>,
    )
    expect(inner(source)).toBe(`<i>icon</i>${MESSAGE}Version 2 is out.</div><a href="/more">Read more</a>`)
  })

  it('gives the message an element of its own, which fills the row and may shrink', () => {
    expect(inner(markup(<Banner aria-label="Notice">Out.</Banner>))).toBe(`${MESSAGE}Out.</div>`)
  })

  it('takes a node as the message, not only a string', () => {
    const source = markup(<Banner aria-label="Notice">Version <strong>2</strong> is out.</Banner>)
    expect(inner(source)).toBe(`${MESSAGE}Version <strong>2</strong> is out.</div>`)
  })

  it('renders the icon as given, a direct child of the row and hidden from a screen reader', () => {
    const source = markup(<Banner aria-label="Notice" icon={<Svg icon={bell} size="xs" />}>Out.</Banner>)
    expect(inner(source)).toMatch(/^<svg width="16" height="16"[^>]*aria-hidden="true"[^>]*>.*<\/svg><div class="min-w-0 flex-1">Out\.<\/div>$/)
  })

  it('has no icon of its own: the drawing marks it optional and names none per tone', () => {
    expect(markup(<Banner aria-label="Notice" tone="danger">Failed.</Banner>)).not.toContain('<svg')
  })

  it('renders a zero, which React prints as text', () => {
    expect(inner(markup(<Banner aria-label="Notice">{0}</Banner>))).toBe(`${MESSAGE}0</div>`)
  })
})

describe('a missing slot leaves no element behind, so it opens no gap', () => {
  it('renders the action alone', () => {
    expect(inner(markup(<Banner aria-label="Notice" action={<b>Go</b>} />))).toBe('<b>Go</b>')
  })

  const EMPTY = [
    ['false', false], ['true', true], ['an empty string', ''], ['null', null],
    ['an empty array', []], ['an array of nothing', [null, false, '', [undefined]]],
  ] as const
  for (const [name, empty] of EMPTY) {
    it(`treats ${name} as nothing in every slot`, () => {
      expect(inner(markup(<Banner aria-label="Notice" icon={empty} action={empty}>{empty}</Banner>)), name).toBe('')
    })
  }
})

describe('long text wraps; nothing truncates', () => {
  const LONG = 'https://example.com/projects/topclassui/deployments/2026-10-09/logs/build-step-four-of-six.txt'

  it('keeps every character, because a message is data and is never cut', () => {
    expect(inner(markup(<Banner aria-label="Notice">{LONG}</Banner>))).toBe(`${MESSAGE}${LONG}</div>`)
  })

  it('carries no truncate, line clamp or ellipsis anywhere', () => {
    expect(markup(<Banner aria-label="Notice" action="Open">{LONG}</Banner>)).not.toMatch(/truncate|line-clamp|text-ellipsis/)
  })
})
