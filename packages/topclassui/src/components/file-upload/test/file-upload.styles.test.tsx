import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import {
  FILE_UPLOAD_ANNOUNCE, FILE_UPLOAD_BROWSE, FILE_UPLOAD_HINT, FILE_UPLOAD_ICON, FILE_UPLOAD_INPUT, FILE_UPLOAD_LIST,
  FILE_UPLOAD_MESSAGE, FILE_UPLOAD_PROMPT, FILE_UPLOAD_ROOT, FILE_UPLOAD_ZONE,
} from '../classes.js'
import { FileUpload } from '../index.js'

// Which element wears which string, in the server HTML: the static specs measure exactly this markup.
const html = markup(<FileUpload aria-label="Files" className="p-1">Hint</FileUpload>)
const classes = [...html.matchAll(/<(\w+)[^>]* class="([^"]*)"/g)].map(([, tag, cls]) => [tag, cls?.replaceAll('&amp;', '&')])

describe('each element wears its own string', () => {
  it('in document order, the svg aside', () => {
    expect(classes.filter(([tag]) => tag !== 'svg')).toEqual([
      ['div', `${FILE_UPLOAD_ROOT} p-1`],
      ['div', FILE_UPLOAD_ZONE],
      ['span', FILE_UPLOAD_ICON],
      ['span', FILE_UPLOAD_PROMPT],
      ['span', FILE_UPLOAD_BROWSE],
      ['span', FILE_UPLOAD_HINT],
      ['input', FILE_UPLOAD_INPUT],
      ['ul', FILE_UPLOAD_LIST],
      ['div', FILE_UPLOAD_MESSAGE],
      ['div', FILE_UPLOAD_ANNOUNCE],
    ])
  })

  it('the caller\'s class wins a conflict with the root\'s, merged last (R-5.2-2)', () => {
    expect(markup(<FileUpload aria-label="Files" className="gap-8" />)).toMatch(/^<div class="relative grid min-w-0 grid-cols-1 text-body gap-8">/)
  })
})

describe('the strings say what the plan draws', () => {
  it('the zone: dashed, the 3:1 line, the box radius, the ring when the input has the keyboard, the invalid mark', () => {
    for (const cls of ['border-dashed', 'border-line-strong', 'rounded-box', 'has-focus-visible:outline-solid', 'has-aria-invalid:border-danger-solid', 'data-disabled:opacity-50']) {
      expect(FILE_UPLOAD_ZONE.split(' '), cls).toContain(cls)
    }
  })

  it('the input fills the zone and is unseen, with the hand, and not-allowed when disabled', () => {
    expect(FILE_UPLOAD_INPUT).toBe('absolute inset-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed aria-disabled:cursor-not-allowed data-disabled:cursor-not-allowed data-readonly:cursor-default data-loading:cursor-default')
  })

  it('the hidden status line is out of the grid, so a refusal adds no gap', () => {
    expect([FILE_UPLOAD_ROOT.split(' ')[0], FILE_UPLOAD_ANNOUNCE]).toEqual(['relative', 'sr-only'])
  })

  it('nothing names a palette colour, a physical side or a hand-written duration', () => {
    const all = classes.map(([, cls]) => cls).join(' ')
    expect(all).not.toMatch(/-(red|blue|gray|slate|violet|neutral)-\d|\b(left|right)-|\b[mp][lr]-|duration-\d/)
  })
})
