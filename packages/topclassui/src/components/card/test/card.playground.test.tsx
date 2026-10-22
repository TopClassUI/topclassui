import { describe, expect, it } from 'vitest'

import { image } from '#icons/data/image.js'
import { markup } from '#test/markup.js'
import Playground from '../dummy/playground.js'

describe('the Try it stage', () => {
  it('starts as the frame draws it: a plain card with its footer of two buttons, no media', () => {
    const html = markup(<Playground />)
    expect(html).not.toContain('<a ')
    expect(html).not.toContain(`d="${image.path}"`)
    expect(html.match(/<button/g)).toHaveLength(2)
  })

  it('renders the whole card as one link when interactive, with no button inside it', () => {
    const html = markup(<Playground interactive />)
    expect(html).toMatch(/^<div[^>]*><a href="#card" class="[^"]*cursor-pointer/)
    expect(html).not.toContain('<button')
    expect(html).toContain('Read more')
  })

  it('adds the media band when media is on', () => {
    expect(markup(<Playground media />)).toContain(`d="${image.path}"`)
  })

  it('leaves the footer out when footer is off', () => {
    const html = markup(<Playground footer={false} />)
    expect(html).not.toContain('Read more')
    expect(html).not.toContain('<button')
  })
})
