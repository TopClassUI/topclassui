import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { AvatarGroup } from '../index.js'

const shown = (html: string) => html.split('<span>m</span>').length - 1
const text = (html: string) => /role="img"[^>]*><span[^>]*>([^<]*)<\/span>/.exec(html)?.[1]

describe('max counts children the way React counts them', () => {
  it('skips null, undefined and false, so a conditional member is not a member', () => {
    const html = markup(
      <AvatarGroup max={2}>
        {null}
        <span>m</span>
        {false}
        <span>m</span>
        {undefined}
      </AvatarGroup>,
    )
    expect(shown(html)).toBe(2)
    expect(html).not.toContain('role="img"')
  })

  it('flattens an array beside single children, so a mapped list counts one by one', () => {
    const html = markup(
      <AvatarGroup max={2}>
        <span>m</span>
        {[<span key="a">m</span>, <span key="b">m</span>, <span key="c">m</span>]}
      </AvatarGroup>,
    )
    expect(shown(html)).toBe(2)
    expect(text(html)).toBe('+2')
  })

  it('counts a fragment as one child, so its members are never split by the cut', () => {
    const html = markup(
      <AvatarGroup max={1}>
        <>
          <span>m</span>
          <span>m</span>
        </>
        <span>m</span>
      </AvatarGroup>,
    )
    expect(shown(html)).toBe(2)
    expect(text(html)).toBe('+1')
  })

  it('keeps the order it was given and hides from the end', () => {
    const html = markup(
      <AvatarGroup max={2}>
        <i>first</i>
        <i>second</i>
        <i>third</i>
      </AvatarGroup>,
    )
    expect(html).toContain('<i>first</i><i>second</i><span')
    expect(html).not.toContain('third')
  })

  it('renders a hidden child nowhere: not in the markup, and not for a screen reader', () => {
    const html = markup(
      <AvatarGroup max={1}>
        <span>m</span>
        <img src="/team/hidden.jpg" alt="Hidden member" />
      </AvatarGroup>,
    )
    expect(html).not.toContain('hidden.jpg')
    expect(html).not.toContain('Hidden member')
  })
})
