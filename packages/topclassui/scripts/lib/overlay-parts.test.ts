import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { categoryOf, exportedValueNames, missingBody, pascalOf, unpublishedStickyEdges } from './overlay-parts.js'

const COMPONENTS = join(process.cwd(), 'src', 'components')
const read = (...parts: string[]) => readFileSync(join(COMPONENTS, ...parts), 'utf8')

const DIALOG_INDEX = [
  "export {",
  "  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot,",
  "} from './client.js'",
  "export type { DialogBodyProps, DialogRootProps } from './types.js'",
].join('\n')

describe('exportedValueNames', () => {
  it('reads a re-export list and leaves the type list out', () => {
    expect(exportedValueNames(DIALOG_INDEX)).toEqual(['DialogBody', 'DialogClose', 'DialogFooter', 'DialogHeader', 'DialogPopup', 'DialogRoot'])
  })

  it('reads an inline type qualifier, an alias, a declared function and CRLF', () => {
    const source = "export { type SheetProps, SheetPanel as SheetBody } from './client.js'\r\nexport function SheetRoot() {}\r\n"
    expect(exportedValueNames(source)).toEqual(['SheetBody', 'SheetRoot'])
  })
})

describe('missingBody', () => {
  const broken = exportedValueNames(DIALOG_INDEX).filter((name) => name !== 'DialogBody')

  it('passes a dialog that exports its Body', () => {
    expect(missingBody('dialog', 'overlays', exportedValueNames(DIALOG_INDEX))).toBeNull()
  })

  it('rejects a dialog whose Body was deleted, by name, before it looks at the category', () => {
    expect(missingBody('dialog', null, broken)).toBe(
      'index.tsx exports no DialogBody, and PLAN 10.5 names it a scrolling overlay: the Body is its scroll container (R-9.2-4, R-10.5-1).',
    )
  })

  it('rejects a drawer that dropped its header, its body and its footer together', () => {
    expect(missingBody('drawer', 'overlays', ['DrawerRoot', 'DrawerPopup'])).toContain('exports no DrawerBody')
  })

  it('rejects any overlay with a Header or a Footer and no Body', () => {
    expect(missingBody('bottom-sheet', 'overlays', ['BottomSheetRoot', 'BottomSheetFooter'])).toBe(
      'index.tsx exports no BottomSheetBody, and it exports a BottomSheetHeader or a BottomSheetFooter: the Body is its scroll container (R-9.2-4, R-10.5-1).',
    )
  })

  it('leaves a popup with no chrome alone, and a header outside the overlays', () => {
    expect(missingBody('popover', 'overlays', ['PopoverRoot', 'PopoverPopup'])).toBeNull()
    expect(missingBody('card', 'media-and-display', ['CardRoot', 'CardHeader', 'CardFooter'])).toBeNull()
  })

  it('names the prefix in PascalCase', () => {
    expect(pascalOf('date-picker')).toBe('DatePicker')
  })
})

describe('unpublishedStickyEdges', () => {
  it('rejects a bar that wears STICKY_TOP and never writes --tc-sticky-top', () => {
    expect(unpublishedStickyEdges(["export const BAR = `${STICKY_TOP} px-4`"])).toEqual(['--tc-sticky-top'])
  })

  it('passes one that writes it in any file of the folder, and a folder with no sticky bar', () => {
    expect(unpublishedStickyEdges(['const A = STICKY_TOP', "export const OFFSET = '--tc-sticky-top'"])).toEqual([])
    expect(unpublishedStickyEdges(['const STICKY_TOPPING = 1'])).toEqual([])
  })

  it('rejects one that only mentions the variable, in a comment or a description', () => {
    const mentions = ['const A = STICKY_TOP', '/** publishes its height as --tc-sticky-top. */', "describe('as --tc-sticky-top.')"]
    expect(unpublishedStickyEdges(mentions)).toEqual(['--tc-sticky-top'])
  })

  it('treats the bottom edge the same', () => {
    expect(unpublishedStickyEdges(['STICKY_BOTTOM'])).toEqual(['--tc-sticky-bottom'])
  })
})

describe('the components on disk', () => {
  const slugs = readdirSync(COMPONENTS, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)

  it('reads the category of every folder, so an overlay cannot slip past as uncategorised', () => {
    expect(slugs.filter((slug) => categoryOf(read(slug, 'meta.ts')) === null)).toEqual([])
    expect(categoryOf(read('drawer', 'meta.ts'))).toBe('overlays')
  })

  it('Dialog and Drawer export their Body, and no overlay is missing one', () => {
    expect(exportedValueNames(read('dialog', 'index.tsx'))).toContain('DialogBody')
    expect(exportedValueNames(read('drawer', 'index.tsx'))).toContain('DrawerBody')
    const missing = slugs.map((slug) => missingBody(slug, categoryOf(read(slug, 'meta.ts')), exportedValueNames(read(slug, 'index.tsx'))))
    expect(missing.filter(Boolean)).toEqual([])
  })

  it('Navbar wears STICKY_TOP and writes --tc-sticky-top', () => {
    expect(read('navbar', 'classes.ts')).toContain('STICKY_TOP')
    expect(unpublishedStickyEdges([read('navbar', 'classes.ts'), read('navbar', 'constants.ts')])).toEqual([])
  })
})
