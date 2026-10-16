import { describe, expect, it } from 'vitest'

import type { ComponentMeta } from '../../src/shared/meta.js'
import { mergeRows, renderReadme } from './readme.js'
import { type PartFamily, type Reach, reachLine } from './readme-parts.js'

const meta: ComponentMeta = {
  name: 'Sheet',
  slug: 'sheet',
  category: 'overlays',
  tier: 1,
  status: 'beta',
  rendering: 'client',
  baseUi: 'dialog',
  baseUiRange: '1.8.0',
  optionalDeps: [],
}

const SIZE = { name: 'size', required: false, type: '`sm` | `md`', default: '`"md"`', description: 'SheetPopup: the widest it grows.' }
const CHILDREN = { name: 'children', required: false, type: '`ReactNode`', default: '-', description: 'The trigger and the popup.' }

const family = (over: Partial<PartFamily> = {}, rootReach: Reach = 'none'): PartFamily => ({
  parts: [
    { name: 'SheetRoot', rows: [CHILDREN], reach: rootReach },
    { name: 'SheetTrigger', rows: [], reach: 'element' },
    { name: 'SheetPopup', rows: [SIZE], reach: 'element' },
  ],
  ...over,
})

const render = (over: Partial<PartFamily> = {}, rootReach: Reach = 'none') =>
  renderReadme({ meta, props: [], demos: [], handWritten: 'prose', family: family(over, rootReach) })

describe('a part family is imported by its flat names', () => {
  it('lists every part, one per line, and never the bare name', () => {
    expect(render()).toContain("```tsx\nimport {\n  SheetRoot,\n  SheetTrigger,\n  SheetPopup,\n} from 'topclassui'\n```")
    expect(render()).not.toContain('import { Sheet }')
  })
})

describe('a part family lists its props part by part', () => {
  it('gives each part a heading and a table of its own props', () => {
    expect(render()).toContain([
      '### SheetPopup',
      '',
      '| Prop | Required | Type | Default | What it does |',
      '|---|---|---|---|---|',
      '| `size` | no | `sm` \\| `md` | `"md"` | SheetPopup: the widest it grows. |',
    ].join('\n'))
  })

  it('says so for a part with no props of its own', () => {
    expect(render()).toContain('### SheetTrigger\n\nThis part takes no design props of its own.\n')
  })

  it('names a required prop with the part it belongs to', () => {
    const required = render({ parts: [{ name: 'SheetRoot', rows: [{ ...CHILDREN, required: true }], reach: 'none' }] })
    expect(required).toContain('Required: `children` on `SheetRoot`. Every other prop below is optional.')
  })
})

describe('a prop one of two others can stand in for', () => {
  const LABEL = { name: 'aria-label', required: false, type: '`string`', default: '-', description: 'Name.', oneOf: ['aria-labelledby'] }
  const BY = { name: 'aria-labelledby', required: false, type: '`string`', default: '-', description: 'Id.', oneOf: ['aria-label'] }
  const out = render({ parts: [{ name: 'SheetList', rows: [LABEL, BY, SIZE], reach: 'element' }] })

  it('is named above the table as the pair, once, with its part', () => {
    expect(out).toContain('Required: `aria-label` or `aria-labelledby` on `SheetList`. Every other prop below is optional.')
    expect(out).not.toContain('Every prop below is optional')
  })

  it('says in its row what stands in for it, never a plain no', () => {
    expect(out).toContain('| `aria-label` | **yes**, or `aria-labelledby` | `string` |')
    expect(out).toContain('| `aria-labelledby` | **yes**, or `aria-label` | `string` |')
  })

  it('names the literal that asks for it, in the row and above the table', () => {
    const when = render({ parts: [{ name: 'SheetList', rows: [{ ...LABEL, when: '`open`' }], reach: 'element' }] })
    expect(when).toContain('Required: `aria-label` or `aria-labelledby` when `open` on `SheetList`.')
    expect(when).toContain('| `aria-label` | **yes**, or `aria-labelledby` when `open` | `string` |')
  })

  it('sorts after the required props and before the optional ones', () => {
    expect(mergeRows([SIZE], [BY, { ...CHILDREN, required: true }, LABEL]).map((r) => r.name))
      .toEqual(['children', 'aria-label', 'aria-labelledby', 'size'])
  })
})

describe('the closing line follows what each part passes on', () => {
  it('a root that draws no element is never said to take attributes', () => {
    const out = render()
    expect(out).toContain('`SheetRoot` draws no element, so it takes no `className`, `style` or `ref`. Anything else on another part is passed to the element it draws')
    expect(out).not.toContain('passed to the root element')
  })

  it('a root that draws one passes the rest of each part to its own element', () => {
    const out = render({}, 'element')
    expect(out).toContain('Anything else is passed to the element each part draws, so standard attributes')
    expect(out).not.toContain('draws no element')
    expect(out).not.toContain('passed to the root element')
  })

  it('a part that takes a className and nothing else is said to, and not to take attributes', () => {
    const out = render({ parts: [...family().parts, { name: 'SheetMenu', rows: [], reach: 'className' }] })
    expect(out).toContain('`SheetMenu` takes no attribute but `className`, which is merged last, and no `ref`. Anything else on another part')
  })

  it('names nothing for an export that has no props type, such as a function', () => {
    expect(reachLine([{ name: 'toast', reach: null }], 'surface')).toBe('')
  })
})

describe('a single component', () => {
  it('still imports its one name and passes the rest to its root element', () => {
    const out = renderReadme({ meta, props: [SIZE], demos: [], handWritten: 'prose' })
    expect(out).toContain("import { Sheet } from 'topclassui'")
    expect(out).toContain('Anything else is passed to the root element')
    expect(out).not.toContain('###')
  })

  it('without a bare <Name> export is imported by the names it has, and promises only what they take', () => {
    const out = renderReadme({
      meta, props: [SIZE], demos: [], handWritten: 'prose',
      surface: [{ name: 'SheetViewport', reach: 'className' }, { name: 'sheet', reach: null }],
    })
    expect(out).toContain("```tsx\nimport { SheetViewport, sheet } from 'topclassui'\n```")
    expect(out).toContain('`SheetViewport` takes no attribute but `className`, which is merged last, and no `ref`.\n')
    expect(out).not.toContain('Anything else')
  })

  it('names the elements that take attributes when it is not one component', () => {
    const out = renderReadme({
      meta, props: [], demos: [], handWritten: 'prose',
      surface: [{ name: 'register', reach: null }, { name: 'Glyph', reach: 'element' }],
    })
    expect(out).toContain('Anything else on `Glyph` is passed to the element it draws, so standard attributes')
  })
})
