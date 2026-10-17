/** A class list cannot show that a class compiles or what it resolves to, so this compiles the real entry with
 * every class of the upload's own strings and reads the rule of each one. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import * as CLASSES_OF from '../classes.js'

const CLASSES = [...new Set(Object.values(CLASSES_OF).join(' ').split(' ').filter(Boolean))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(CLASSES)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** The declarations of the first rule that starts with a selector, without the braces, on one line. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).replace(/\s+/g, ' ').trim()
}

/** The nearest media query before a rule: Tailwind writes each variant's query right around its own rule. */
const queryOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return css.slice(css.lastIndexOf('@media', at), at).split('{')[0]?.trim()
}

describe('every class of the upload paints something', () => {
  it('read the classes, so an empty list cannot pass', () => {
    expect(CLASSES.length).toBeGreaterThan(80)
  })

  it('finds each one in the sheet, the group marker in the selectors that read it, so a typo cannot ship silently', () => {
    expect(CLASSES.filter((cls) => !css.includes(selectorOf(cls)))).toEqual([])
  })
})

describe('the zone', () => {
  it('a dashed line on the surface, with the box radius knob', () => {
    expect(ruleOf(selectorOf('border-dashed'))).toBe('--tw-border-style: dashed; border-style: dashed;')
    expect(ruleOf(selectorOf('bg-surface'))).toBe('background-color: var(--tc-surface);')
    expect(ruleOf(selectorOf('rounded-box'))).toBe('border-radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);')
  })

  it('a drag over it turns the line solid and primary and the fill to the primary tint: more than a fill', () => {
    const dragging = (cls: string) => ruleOf(`${selectorOf(cls)}[data-dragging]`)
    expect(dragging('data-dragging:border-solid')).toBe('--tw-border-style: solid; border-style: solid;')
    expect(dragging('data-dragging:border-primary-solid')).toBe('border-color: var(--tc-primary-solid);')
    expect(dragging('data-dragging:bg-primary-soft')).toBe('background-color: var(--tc-primary-soft);')
  })

  it('under forced colours the line of a drag is Highlight, behind forced-colors: alone', () => {
    const selector = `${selectorOf('forced-colors:data-dragging:border-[Highlight]')}[data-dragging]`
    expect([ruleOf(selector), queryOf(selector)]).toEqual(['border-color: Highlight;', '@media (forced-colors: active)'])
  })

  it('the prompt and the hint wrap a word with no space to break at, and stay inside it', () => {
    expect([CLASSES_OF.FILE_UPLOAD_PROMPT, CLASSES_OF.FILE_UPLOAD_HINT].map((cls) => ['wrap-anywhere', 'max-w-full'].every((name) => cls.split(' ').includes(name)))).toEqual([true, true])
    expect(ruleOf(selectorOf('wrap-anywhere'))).toBe('overflow-wrap: anywhere;')
    expect(ruleOf(selectorOf('max-w-full'))).toBe('max-width: 100%;')
  })

  it('a link or a button in the hint is lifted over the input', () => {
    const lifted = (cls: string) => ruleOf(`${selectorOf(cls)} a, ${selectorOf(cls)} button`)
    expect([lifted('[&_a,&_button]:relative'), lifted('[&_a,&_button]:z-1')]).toEqual(['position: relative;', 'z-index: 1;'])
  })

  it('the input covers it, unseen', () => {
    expect(ruleOf(selectorOf('opacity-0'))).toBe('opacity: 0%;')
    expect(ruleOf(selectorOf('inset-0'))).toBe('inset: 0px;')
  })
})

describe('the list and the status lines', () => {
  it('the list is at most --tc-list-rows whole rows and their gaps, 54 px rows under a coarse pointer, and nothing while empty', () => {
    const fine = selectorOf('max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-min,24px)+var(--spacing)*2+var(--tc-line-width)*2,var(--text-sm)*var(--text-sm--line-height)+var(--spacing)*2+var(--tc-line-width)*2)+(var(--tc-list-rows)-1)*var(--spacing)*1.5)]')
    expect(ruleOf(fine)).toBe('max-height: calc(var(--tc-list-rows) * max(var(--tc-row-height), var(--tc-target-min,24px) + var(--spacing) * 2 + var(--tc-line-width) * 2, var(--text-sm) * var(--text-sm--line-height) + var(--spacing) * 2 + var(--tc-line-width) * 2) + (var(--tc-list-rows) - 1) * var(--spacing) * 1.5);')
    const coarse = selectorOf('pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)+var(--spacing)*2+var(--tc-line-width)*2,var(--text-sm)*var(--text-sm--line-height)+var(--spacing)*2+var(--tc-line-width)*2)+(var(--tc-list-rows)-1)*var(--spacing)*1.5)]')
    expect([ruleOf(coarse), queryOf(coarse)]).toEqual(['max-height: calc(var(--tc-list-rows) * max(var(--tc-row-height), var(--tc-target-coarse,44px) + var(--spacing) * 2 + var(--tc-line-width) * 2, var(--text-sm) * var(--text-sm--line-height) + var(--spacing) * 2 + var(--tc-line-width) * 2) + (var(--tc-list-rows) - 1) * var(--spacing) * 1.5);', '@media (pointer: coarse)'])
    expect(ruleOf(selectorOf('auto-rows-max'))).toBe('grid-auto-rows: max-content;')
    expect(ruleOf(`${selectorOf('empty:hidden')}:empty`)).toBe('display: none;')
  })

  it('a remove of a disabled upload dims with the zone and takes no pointer', () => {
    expect(['disabled:opacity-50', 'disabled:pointer-events-none'].filter((cls) => !CLASSES_OF.FILE_UPLOAD_REMOVE.split(' ').includes(cls))).toEqual([])
    expect([ruleOf(`${selectorOf('disabled:opacity-50')}:disabled`), ruleOf(`${selectorOf('disabled:pointer-events-none')}:disabled`)]).toEqual(['opacity: 50%;', 'pointer-events: none;'])
  })

  it('the message line leaves the grid while empty and stays in the accessibility tree: sr-only, never display none', () => {
    expect(ruleOf(`${selectorOf('empty:sr-only')}:empty`)).toContain('position: absolute;')
    expect(ruleOf(`${selectorOf('empty:sr-only')}:empty`)).not.toContain('display')
  })
})
