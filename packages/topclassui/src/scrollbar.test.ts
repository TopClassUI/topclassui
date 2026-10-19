import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { parseCss } from '../scripts/lib/css-parse.js'
import { readBlocks } from '../scripts/lib/tokens.js'
import { ACCORDION_CONTENT } from './components/accordion/classes.js'
import { CODE_BLOCK_PRE } from './components/code-block/classes.js'
import { COMBOBOX_LIST } from './components/combobox/classes.js'
import { COMMAND_LIST } from './components/command/classes.js'
import { DATE_PICKER_POPUP } from './components/date-picker/classes.js'
import { DIALOG_BODY, DIALOG_POPUP } from './components/dialog/classes.js'
import { DRAWER_BODY, DRAWER_POPUP } from './components/drawer/classes.js'
import { DROPDOWN_POPUP } from './components/dropdown/classes.js'
import { FILE_UPLOAD_LIST } from './components/file-upload/classes.js'
import { NAVBAR_LIST } from './components/navbar/classes.js'
import { POPOVER_POPUP } from './components/popover/classes.js'
import { SEGMENTED_ROOT } from './components/segmented-control/classes.js'
import { SELECT_LIST } from './components/select/classes.js'
import { SIDEBAR_BODY } from './components/sidebar/classes.js'
import { BOX } from './components/table/classes.js'
import { TABS_LIST_SCROLL } from './components/tabs/classes.js'
import { TEXTAREA_BOX } from './components/textarea/classes.js'
import { TOAST_VIEWPORT } from './components/toast/classes.js'
import { TREE_VIEW_TREE } from './components/tree-view/classes.js'

const WIDTH = '[scrollbar-width:thin]'
const COLOR = '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'

const css = readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')
const COMPONENTS = join(process.cwd(), 'src', 'components')

/** A component's classes.ts, or nothing for a folder that has none. */
const classesOf = (dir: string) => {
  try { return readFileSync(join(COMPONENTS, dir, 'classes.ts'), 'utf8') } catch { return '' }
}
const blocks = readBlocks(css)
const declared = (selector: string) => {
  const block = blocks.find((b) => b.selector.replace(/\s+/g, ' ').trim() === selector && b.decls.has('--tc-scrollbar-thumb'))
  return [block?.decls.get('--tc-scrollbar-thumb'), block?.decls.get('--tc-scrollbar-track')]
}

describe('the two scrollbar tokens', () => {
  it('light, and ocean through it: a neutral-500 thumb on a transparent track', () => {
    expect(declared(":root, [data-theme='light']")).toEqual(['var(--color-neutral-500)', 'transparent'])
  })

  it('dark: a neutral-400 thumb on a transparent track', () => {
    expect(declared("[data-theme='dark']")).toEqual(['var(--color-neutral-400)', 'transparent'])
  })

  it('are declared in those two blocks and nowhere else, so ocean keeps the light bar', () => {
    const where = blocks.filter((b) => b.decls.has('--tc-scrollbar-thumb') || b.decls.has('--tc-scrollbar-track'))
    expect(where.map((b) => b.selector.replace(/\s+/g, ' ').trim())).toEqual([":root, [data-theme='light']", "[data-theme='dark']"])
  })
})

/** Every scroll container of the 46, by the constant its element wears. */
const SCROLLERS: Record<string, string> = {
  'accordion region': ACCORDION_CONTENT,
  'code block pre': CODE_BLOCK_PRE,
  'combobox list': COMBOBOX_LIST,
  'command list': COMMAND_LIST,
  'date picker popup': DATE_PICKER_POPUP,
  'dialog popup': DIALOG_POPUP,
  'dialog body': DIALOG_BODY,
  'drawer popup': DRAWER_POPUP,
  'drawer body': DRAWER_BODY,
  'dropdown popup': DROPDOWN_POPUP,
  'file upload list': FILE_UPLOAD_LIST,
  'navbar links': NAVBAR_LIST,
  'popover popup': POPOVER_POPUP,
  'segmented control': SEGMENTED_ROOT,
  'select list': SELECT_LIST,
  'sidebar body': SIDEBAR_BODY,
  'table box': BOX,
  'tabs list': TABS_LIST_SCROLL,
  'textarea': TEXTAREA_BOX,
  'toast viewport': TOAST_VIEWPORT,
  'tree view': TREE_VIEW_TREE,
}

describe('every scroll container wears the shared scrollbar', () => {
  for (const [name, classes] of Object.entries(SCROLLERS)) {
    it(name, () => {
      expect(classes.split(/\s+/)).toEqual(expect.arrayContaining([WIDTH, COLOR]))
    })
  }

  it('the code block sets the two tokens to its own fill, so its bar stays off the page scheme', () => {
    expect(CODE_BLOCK_PRE.split(' ')).toEqual(expect.arrayContaining([
      '[--tc-scrollbar-thumb:var(--tc-neutral-solid-thumb)]', '[--tc-scrollbar-track:var(--tc-neutral-solid)]',
    ]))
  })

  it('no component writes scrollbar-color itself: it sets the two tokens instead', () => {
    expect(readdirSync(COMPONENTS).filter((dir) => classesOf(dir).includes('[scrollbar-color:'))).toEqual([])
  })

  it('a raw overflow in a classes.ts wears the bar on the same line, as the table box does', () => {
    const bare: string[] = []
    for (const dir of readdirSync(COMPONENTS)) {
      for (const line of classesOf(dir).split('\n')) {
        if (/\boverflow(-[xy])?-(auto|scroll)\b/.test(line) && !line.includes('${SCROLLBAR}')) bare.push(`${dir}: ${line.trim().slice(0, 60)}`)
      }
    }
    expect(bare).toEqual([])
  })

  it('a raw overflow in a demo wears a shared scroll constant on the same line', () => {
    const bare: string[] = []
    for (const dir of readdirSync(COMPONENTS)) {
      const dummy = join(COMPONENTS, dir, 'dummy')
      if (!existsSync(dummy)) continue
      for (const demo of readdirSync(dummy)) {
        for (const line of readFileSync(join(COMPONENTS, dir, 'dummy', demo), 'utf8').split('\n')) {
          if (/\boverflow(-[xy])?-(auto|scroll)\b/.test(line) && !/\$\{(SCROLL_AREA|SCROLL_X|SCROLLBAR)\}/.test(line)) bare.push(`${dir}/${demo}: ${line.trim().slice(0, 60)}`)
        }
      }
    }
    expect(bare).toEqual([])
  })
})

describe('the page itself', () => {
  it('draws its own bar thin and in the two tokens, so no page keeps the classic one', () => {
    const html = parseCss(css).rules.filter((rule) => rule.prelude.trim() === 'html')
      .flatMap((rule) => rule.declarations.filter((d) => d.property.startsWith('scrollbar-')).map((d) => `${d.property}: ${d.value}`))
    expect(html).toEqual(['scrollbar-gutter: stable', 'scrollbar-width: thin', 'scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track)'])
  })
})
