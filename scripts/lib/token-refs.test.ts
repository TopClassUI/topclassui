import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { definedTokens, findUndefinedReferences } from './token-refs.js'

const TOKENS = ":root {\n  --tc-radius: 0.5rem;\n  --tc-hover: red;\n}"
const defined = definedTokens(TOKENS)

const check = (content: string) => findUndefinedReferences(defined, [{ file: 'a.ts', content }])

describe('definedTokens', () => {
  it('collects the names on the left of a colon', () => {
    expect([...defined].sort()).toEqual(['--tc-hover', '--tc-radius'])
  })

  it('reads every token the shipped file declares', () => {
    const real = definedTokens(readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8'))
    expect(real.size).toBeGreaterThan(60)
    expect(real.has('--tc-primary-solid')).toBe(true)
  })
})

describe('findUndefinedReferences', () => {
  it('accepts a reference to a declared token', () => {
    expect(check("const HOVER = 'hover:bg-(--tc-hover)'")).toEqual([])
    expect(check('.a { border-radius: var(--tc-radius); }')).toEqual([])
  })

  it('catches the typo that would otherwise paint nothing, with its line', () => {
    const found = check("const A = 1\nconst HOVER = 'hover:bg-(--tc-hovr)'")
    expect(found).toEqual([{ token: '--tc-hovr', file: 'a.ts', line: 2 }])
  })

  it('catches a var() in a stylesheet just the same', () => {
    expect(check('.a { color: var(--tc-nope); }').map((r) => r.token)).toEqual(['--tc-nope'])
  })

  it('reports every occurrence on one line, not just the first', () => {
    const found = check('.a { color: var(--tc-one); background: var(--tc-two); }')
    expect(found.map((r) => r.token)).toEqual(['--tc-one', '--tc-two'])
  })

  it('does not mistake a declaration for a reference, so a new token file passes', () => {
    expect(check('.a { --tc-brand: red; }')).toEqual([])
  })

  it('reads CRLF the same as LF, because the repo is checked out on Windows', () => {
    expect(check('const A = 1\r\nconst B = "--tc-nope"')).toEqual([
      { token: '--tc-nope', file: 'a.ts', line: 2 },
    ])
  })
})
