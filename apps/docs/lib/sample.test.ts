import { describe, expect, it } from 'vitest'

import components from '../.generated/components.json' with { type: 'json' }
import { destage, sampleOf, stagelessOf } from './sample'
import { snippetOf, usageOf } from './usage'

const entries = components.components as readonly { slug: string; demos: readonly { name: string; source: string }[] }[]
const playgroundOf = (slug: string): string => entries.find((entry) => entry.slug === slug)?.demos.find((demo) => demo.name === 'playground')?.source ?? ''

/** What each overlay's THE CODE must open with once the stage is gone: the root a page writes. */
const ROOTS: Record<string, string> = {
  dialog: '<DialogRoot>',
  drawer: '<DrawerRoot>',
  dropdown: '<DropdownRoot>',
  popover: '<PopoverRoot>',
  tooltip: '<TooltipRoot>',
}

describe('an overlay playground, without its docs stage', () => {
  for (const [slug, root] of Object.entries(ROOTS)) {
    it(`${slug}: a usage with the imports it needs, its trees written in, no stage, ref or box`, () => {
      const usage = usageOf(stagelessOf(playgroundOf(slug)))
      expect(usage, slug).not.toBeNull()
      const code = usage === null ? '' : snippetOf(usage, [])
      expect(code.split('\n\n')[1]?.split('\n')[0], slug).toBe(root)
      expect(code, slug).not.toMatch(/\bstage\b|useRef|useState|data-stage|container=|initialFocus=|\{content\}|\{rows\}|\{sheet\}/)
    })
  }

  it('dialog: the Try it size lands on the popup where the playground passes it', () => {
    const usage = usageOf(stagelessOf(playgroundOf('dialog')))
    expect(usage === null ? '' : snippetOf(usage, [['size', 'lg']])).toContain('<DialogPopup size="lg">')
  })

  it('toast: the button that adds one, with no rest spread and no stage', () => {
    const code = sampleOf(playgroundOf('toast'))
    expect(code).toContain("toast.add({ title: TITLE, description: DESCRIPTION })")
    expect(code).toContain('export default function Demo() {')
    expect(code).not.toMatch(/\bstage\b|\.\.\.props|ToastStage/)
  })

  it('command: the state and the palette, without the picture of the stage or the classes it was drawn with', () => {
    const code = sampleOf(playgroundOf('command'))
    expect(code).toContain('const [open, setOpen] = useState(false)')
    expect(code).not.toMatch(/function Stage|OVERLAY_SURFACE|CONTAIN|const row =|const panel =|Kbd/)
  })

  it('leaves a demo with no stage as it was', () => {
    const source = "export default function Demo(props: P) {\n  return <A {...props} />\n}\n"
    expect(destage(source)).toBe(source)
  })
})

describe('a demo that only returns a tree', () => {
  it('loses its wrapper and keeps its imports and constants', () => {
    const source = "import { A } from 'topclassui/a'\n\nconst ITEMS = [1]\n\n/** Docs. */\nexport default function Demo() {\n  return (\n    <div>\n      <A items={ITEMS} />\n    </div>\n  )\n}\n"
    expect(sampleOf(source)).toBe("import { A } from 'topclassui/a'\n\nconst ITEMS = [1]\n\n<div>\n  <A items={ITEMS} />\n</div>\n")
  })

  it('keeps it when the file is a client one, since a handler needs a component around it', () => {
    const source = "'use client'\n\nimport { A } from 'topclassui/a'\n\nexport default function Demo() {\n  return <A onClick={() => undefined} />\n}\n"
    expect(sampleOf(source)).toContain('export default function Demo() {')
  })
})
