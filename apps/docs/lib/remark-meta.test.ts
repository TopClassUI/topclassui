import { describe, expect, it } from 'vitest'

import remarkMeta from './remark-meta.mjs'

const fence = (meta: string | null) => ({ type: 'code', lang: 'tsx', meta, value: '', data: undefined as unknown })

describe('remarkMeta', () => {
  it('keeps the info string, and numbers a title the page shows again from 2', () => {
    const tree = { type: 'root', children: [fence('title="page.tsx" check'), fence('title="a.ts"'), fence(null), fence('title="page.tsx" check')] }
    remarkMeta()(tree)
    expect(tree.children.map((node) => node.data)).toEqual([
      { hProperties: { 'data-meta': 'title="page.tsx" check' } },
      { hProperties: { 'data-meta': 'title="a.ts"' } },
      undefined,
      { hProperties: { 'data-meta': 'title="page.tsx" check', 'data-repeat': '2' } },
    ])
  })
})
