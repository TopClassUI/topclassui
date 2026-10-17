import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import * as otp from '../index.js'

/** Each name a file's export statements give, type-only ones included; `export *` reads as '*'. */
function exportedNames(source: string): string[] {
  const file = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest)
  return file.statements.flatMap((node): string[] => {
    if (!ts.isExportDeclaration(node)) return []
    const clause = node.exportClause
    if (!clause) return ['*']
    return ts.isNamedExports(clause) ? clause.elements.map((e) => e.name.text) : [clause.name.text]
  })
}

describe('index.tsx exports flat names (R-9.2-3)', () => {
  it('exports exactly OTPField and OTPFieldSkeleton, two function components; OtpField, the folder\'s spelling, is not an export (choice 24)', () => {
    expect(Object.keys(otp).sort()).toEqual(['OTPField', 'OTPFieldSkeleton'])
    expect([typeof otp.OTPField, typeof otp.OTPFieldSkeleton]).toEqual(['function', 'function'])
    expect('OtpField' in otp).toBe(false)
    expect('OtpFieldSkeleton' in otp).toBe(false)
  })

  it('has no Base UI type name, no context and no hook in its surface', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'index.tsx'), 'utf8')
    expect(exportedNames(source).sort()).toEqual([
      'OTPField', 'OTPFieldProps', 'OTPFieldSkeleton', 'OTPFieldSkeletonProps', 'OtpFieldDesignProps', 'OtpFieldName', 'OtpFieldProps',
      'OtpFieldValidationType',
    ])
  })

  it('the scan sees a type-only alias and a star export', () => {
    expect(exportedNames("export type { A as B } from './a.js'\nexport * from './d.js'\n")).toEqual(['B', '*'])
  })
})
