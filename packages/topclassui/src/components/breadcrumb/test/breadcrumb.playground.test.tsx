import { describe, expect, it } from 'vitest'

import { house } from '#icons/data/house.js'
import { markup } from '#test/markup.js'
import Playground from '../dummy/playground.js'

/** The text each list item shows, or 'gap' for the folded crumbs. */
const shown = (out: string) => [...out.matchAll(/<li([^>]*)>(.*?)<\/li>/g)].map((match) =>
  (match[1]?.includes('aria-hidden') ? 'gap' : (match[2] ?? '').replace(/<[^>]*>/g, '')))

describe('the Try it stage', () => {
  it('starts as the frame draws it: the house for Home and the four crumbs whole at maxItems 4', () => {
    const html = markup(<Playground />)
    expect(shown(html)).toEqual(['Home', 'Docs', 'Components', 'Button'])
    expect(html).toContain(`d="${house.path}"`)
  })

  it('drops the house when showHome is off', () => {
    expect(markup(<Playground showHome={false} />)).not.toContain(`d="${house.path}"`)
  })

  it('folds the trail when maxItems is below its length', () => {
    expect(shown(markup(<Playground maxItems={2} />))).toEqual(['Home', 'gap', 'Button'])
    expect(shown(markup(<Playground maxItems={3} />))).toEqual(['Home', 'gap', 'Components', 'Button'])
  })
})
