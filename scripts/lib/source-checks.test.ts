import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient,
  hasUseClient,
  importedNames,
  relativeImportsMissingExtension,
} from './source-checks.js'

/** The same source with Windows line endings, so a CRLF checkout cannot change a result. */
const crlf = (s: string) => s.replace(/\n/g, '\r\n')

describe.each([
  ['LF', (s: string) => s],
  ['CRLF', crlf],
])('%s line endings', (_name, fix) => {
  it('finds a leading use client', () => {
    expect(hasUseClient(fix("'use client'\nexport function A() {}\n"))).toBe(true)
    expect(hasUseClient(fix('"use client";\nexport function A() {}\n'))).toBe(true)
  })

  it('finds one after a byte order mark, which Windows editors add', () => {
    expect(hasUseClient(fix("﻿'use client'\nexport function A() {}\n"))).toBe(true)
  })

  it('does not see a directive that is not there', () => {
    expect(hasUseClient(fix('export function A() {}\n'))).toBe(false)
  })

  it('catches a use client placed after an import, where it is a dead string', () => {
    const source = fix("import { x } from './x.js'\n'use client'\nexport function A() {}\n")
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(true)
  })

  it('does not call a correct directive late', () => {
    expect(hasLateUseClient(fix("'use client'\nimport { x } from './x.js'\n"))).toBe(false)
  })

  it('reads named imports and drops the type qualifier', () => {
    const source = fix("import { useId, type Ref, use as useCtx } from 'react'\n")
    expect(importedNames(source, 'react')).toEqual(['useId', 'Ref', 'use'])
  })

  it('finds a relative import with no extension', () => {
    const source = fix("import { a } from './lib'\nimport { b } from './ok.js'\n")
    expect(relativeImportsMissingExtension(source)).toEqual(['./lib'])
  })

  it('allows .js, .json and .css', () => {
    const source = fix("import a from './a.js'\nimport b from './b.json'\nimport './c.css'\n")
    expect(relativeImportsMissingExtension(source)).toEqual([])
  })

  it('leaves bare package specifiers alone', () => {
    expect(relativeImportsMissingExtension(fix("import { z } from 'zod'\n"))).toEqual([])
  })
})
