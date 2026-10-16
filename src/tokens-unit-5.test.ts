import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { definedTokens, findUndefinedReferences } from '../scripts/lib/token-refs.js'
import { readBlocks } from '../scripts/lib/tokens.js'

const css = readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')
const blocks = readBlocks(css)
const root = blocks.find((block) => block.selector.trim() === ':root')

// R-4-2: Meter sets the first inline and TreeView the second on each row; neither exists yet, so this file holds them.
describe('the unit 5 tokens on the root', () => {
  it('--tc-meter-value is 0% until a Meter sets it, a percentage a width can take', () => {
    expect(root?.decls.get('--tc-meter-value')).toBe('0%')
  })

  it('--tc-tree-level is a bare 0 until a row sets it, so the indent can multiply by it', () => {
    expect(root?.decls.get('--tc-tree-level')).toBe('0')
  })

  it('--tc-tree-indent is 1.125rem a level, scaled by the density knob', () => {
    expect(root?.decls.get('--tc-tree-indent')).toBe('calc(1.125rem * var(--tc-density))')
  })

  it('sit under the list spacers, in this order, each under a comment of one line', () => {
    expect([...(root?.decls.keys() ?? [])].slice(-4)).toEqual([
      '--tc-list-pad-end', '--tc-meter-value', '--tc-tree-level', '--tc-tree-indent',
    ])
    expect(css).toMatch(/\n {2}\/\*[^\n]*\*\/\n {2}--tc-meter-value: 0%;\n {2}\/\*[^\n]*\*\/\n {2}--tc-tree-level: 0;\n {2}\/\*[^\n]*\*\/\n {2}--tc-tree-indent: calc\(1\.125rem \* var\(--tc-density\)\);\n\}/)
  })

  it('are declared nowhere else, so no theme or mode moves them', () => {
    const names = ['--tc-meter-value', '--tc-tree-level', '--tc-tree-indent']
    const elsewhere = blocks.filter((block) => block !== root && names.some((name) => block.decls.has(name)))
    expect(elsewhere.map((block) => block.selector)).toEqual([])
  })

  it('pass R-4-2 for a component that reads all three, as check-css reads it', () => {
    const reader = {
      file: 'src/components/example/classes.ts',
      content: "export const BAR = 'w-(--tc-meter-value)'\nexport const ROW = 'ps-[calc(var(--tc-tree-indent)*var(--tc-tree-level))]'\n",
    }
    expect(findUndefinedReferences(definedTokens(css), [reader])).toEqual([])
  })
})

// e2e/code-block.spec.ts measures it 3:1 off the fill and off the on-solid ring in every mode, over a real scrollbar.
describe('the scrollbar thumb on the neutral fill', () => {
  it('is halfway between the fill and its text, on every themed element, so a nested theme recomputes it', () => {
    const themed = blocks.filter((block) => block.decls.has('--tc-neutral-solid-thumb'))
    expect(themed.map((block) => [block.selector.replace(/\s+/g, ' '), block.decls.get('--tc-neutral-solid-thumb')])).toEqual([
      [':root, [data-theme]', 'color-mix(in oklch, var(--tc-neutral-on-solid) 50%, var(--tc-neutral-solid))'],
    ])
  })
})
