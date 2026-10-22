import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import Playground from '../dummy/playground.js'

const caps = (html: string) => html.match(/<kbd[^>]*>/g) ?? []

describe('the Try it stage', () => {
  it('draws the three keys of the frame, idle, at rest', () => {
    const html = markup(<Playground />)
    expect(html.replace(/<[^>]*>/g, '')).toBe('CtrlShiftK')
    expect(caps(html).filter((tag) => /data-(pressed|disabled)=/.test(tag))).toEqual([])
  })

  it('hands pressed to every key', () => {
    expect(caps(markup(<Playground pressed />)).filter((tag) => tag.includes('data-pressed=""'))).toHaveLength(3)
  })

  it('hands disabled to every key', () => {
    expect(caps(markup(<Playground disabled />)).filter((tag) => tag.includes('data-disabled=""'))).toHaveLength(3)
  })
})
