import { describe, expect, it } from 'vitest'

import type { ComponentMeta } from '../../src/shared/meta.js'
import { renderReadme } from './readme.js'
import type { PartFamily } from './readme-parts.js'

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

const family = (over: Partial<PartFamily> = {}): PartFamily => ({
  parts: [
    { name: 'SheetRoot', rows: [CHILDREN] },
    { name: 'SheetTrigger', rows: [] },
    { name: 'SheetPopup', rows: [SIZE] },
  ],
  rootDraws: false,
  ...over,
})

const render = (over: Partial<PartFamily> = {}) =>
  renderReadme({ meta, props: [], demos: [], handWritten: 'prose', family: family(over) })

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
    const required = render({ parts: [{ name: 'SheetRoot', rows: [{ ...CHILDREN, required: true }] }] })
    expect(required).toContain('Required: `children` on `SheetRoot`. Every other prop below is optional.')
  })
})

describe('the closing line follows what the root draws', () => {
  it('a root that draws no element is never said to take attributes', () => {
    const out = render()
    expect(out).toContain('`SheetRoot` draws no element, so it takes no `className`, `style` or `ref`. Anything else on another part is passed to the element it draws')
    expect(out).not.toContain('passed to the root element')
  })

  it('a root that draws one passes the rest of each part to its own element', () => {
    const out = render({ rootDraws: true })
    expect(out).toContain('Anything else is passed to the element each part draws, so standard attributes')
    expect(out).not.toContain('draws no element')
    expect(out).not.toContain('passed to the root element')
  })
})

describe('a single component is untouched', () => {
  it('still imports its one name and passes the rest to its root element', () => {
    const out = renderReadme({ meta, props: [SIZE], demos: [], handWritten: 'prose' })
    expect(out).toContain("import { Sheet } from 'topclassui'")
    expect(out).toContain('Anything else is passed to the root element')
    expect(out).not.toContain('###')
  })
})
