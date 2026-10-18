import { describe, expect, it } from 'vitest'

import { ar } from '../labels/ar.js'
import { en } from '../labels/en.js'
import { hashOf, printValue, providerProps, themeUtilities } from './lib/guide-facts.js'

describe('the provider props table', () => {
  const rows = providerProps()

  it('lists the provider’s own props, in the order its type declares them', () => {
    expect(rows.map((row) => row.name)).toEqual(['children', 'className', 'direction', 'locale', 'labels', 'numberingSystem', 'adaptive', 'collection', 'toast'])
  })

  it('marks direction and locale required and spells out a union of literals', () => {
    expect(rows.filter((row) => row.required).map((row) => row.name)).toEqual(['direction', 'locale'])
    expect(rows.find((row) => row.name === 'direction')?.type).toBe("'ltr' | 'rtl'")
    expect(rows.find((row) => row.name === 'numberingSystem')?.type).toBe("'latn' | 'arab'")
  })

  it('reads the defaults from the library’s own constants', () => {
    expect(rows.find((row) => row.name === 'adaptive')?.default).toBe("{ query: '(width < 48rem)' }")
    expect(rows.find((row) => row.name === 'collection')?.default).toBe('{ visibleRows: 7, virtualizeAbove: 200, loadMoreThreshold: 10, estimateRowHeight: 36, overscan: 6 }')
    expect(rows.find((row) => row.name === 'locale')?.default).toBe('-')
  })

  it('has a description for every prop in both languages, and none for a prop that is gone', () => {
    for (const labels of [en, ar]) {
      expect(Object.keys(labels.providerProps).sort()).toEqual(rows.map((row) => row.name).sort())
    }
  })
})

describe('themeUtilities', () => {
  it('groups the @theme inline block by tone and scale, with the utility a component writes', () => {
    const css = '@theme inline {\n  --color-body: var(--tc-body);\n  --color-primary-solid: var(--tc-primary-solid);\n  --color-primary-on-soft: var(--tc-primary-on-soft);\n  --color-line-strong: var(--tc-line-strong);\n  --color-ring: var(--tc-ring);\n  --spacing-control-xs: calc(1.75rem * var(--tc-density));\n  --spacing-pad-x-md: 1rem;\n  --radius-box: 1rem;\n}\n'
    expect(themeUtilities(css)).toEqual([
      { tokens: ['--tc-body'], utilities: ['text-body'] },
      { tokens: ['--tc-primary-solid', '--tc-primary-on-soft'], utilities: ['bg-primary-solid', 'text-primary-on-soft'] },
      { tokens: ['--tc-line-strong'], utilities: ['border-line-strong'] },
      { tokens: ['--tc-ring'], utilities: ['outline-ring'] },
      { tokens: ['--spacing-control-xs'], utilities: ['h-control-xs'] },
      { tokens: ['--spacing-pad-x-md'], utilities: ['px-pad-x-md'] },
      { tokens: ['--radius-box'], utilities: ['rounded-box'] },
    ])
  })

  it('reads the library’s styles.css, controls and radius knobs included', () => {
    const rows = themeUtilities()
    expect(rows.find((row) => row.tokens.includes('--tc-page'))?.utilities).toEqual(['bg-page'])
    expect(rows.find((row) => row.tokens.includes('--spacing-control-md'))?.utilities).toEqual(['h-control-xs', 'h-control-sm', 'h-control-md', 'h-control-lg', 'h-control-xl'])
    expect(rows.find((row) => row.tokens.includes('--tc-radius'))?.utilities).toEqual(['rounded-control', 'rounded-box', 'rounded-chip'])
  })
})

describe('hashOf and printValue', () => {
  it('writes the CSP source of a script as sha256- and base64', () => {
    expect(hashOf('abc')).toBe('sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=')
  })

  it('prints a default as TypeScript', () => {
    expect(printValue({ placement: 'bottom-end', limit: 3 })).toBe("{ placement: 'bottom-end', limit: 3 }")
  })
})
