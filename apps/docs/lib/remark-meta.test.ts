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

  it('numbers untitled fences by the name they show, "code" or "terminal", and leaves a WrongRight pane to its pair', () => {
    const shell = () => ({ type: 'code', lang: 'bash', meta: null, value: '', data: undefined as unknown })
    const fences = [fence(null), shell(), fence(null), fence(null), shell()]
    const [first, terminal, second, pane, again] = fences
    const tree = { type: 'root', children: [first, terminal, second, { type: 'mdxJsxFlowElement', name: 'WrongRight', children: [pane] }, again] }
    remarkMeta()(tree)
    expect(fences.map((node) => node.data)).toEqual([
      undefined,
      undefined,
      { hProperties: { 'data-repeat': '2' } },
      undefined,
      { hProperties: { 'data-repeat': '2' } },
    ])
  })
})
