import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { readBlocks } from '../../../scripts/lib/tokens.js'

const blocks = readBlocks(readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8'))
const root = blocks.find((block) => block.selector.trim() === ':root')

// R-4-2: a windowed list writes these inline; a list that writes nothing reads the 0px here.
describe('the spacers of a windowed list', () => {
  it('are declared on the root, as a length a calc() can take, and are 0px until a list sets them', () => {
    expect(root?.decls.get('--tc-list-pad-start')).toBe('0px')
    expect(root?.decls.get('--tc-list-pad-end')).toBe('0px')
  })

  it('are declared nowhere else, so no theme or mode moves them', () => {
    const elsewhere = blocks.filter((block) => block !== root && [...block.decls.keys()].some((name) => name.startsWith('--tc-list-pad-')))
    expect(elsewhere.map((block) => block.selector)).toEqual([])
  })
})
