import { describe, expect, it } from 'vitest'

import { files, pascalCase, readSlug, screamingCase } from './scaffold.js'

describe('the name', () => {
  it('becomes the component and the constant prefix', () => {
    expect(pascalCase('badge')).toBe('Badge')
    expect(pascalCase('icon-button')).toBe('IconButton')
    expect(screamingCase('icon-button')).toBe('ICON_BUTTON')
    expect(screamingCase('badge')).toBe('BADGE')
  })

  it('refuses anything that is not kebab-case, which the folder contract requires', () => {
    for (const bad of ['IconButton', 'icon_button', 'Icon-Button', '1badge', 'icon--button', 'icon-']) {
      expect(() => readSlug(bad), bad).toThrow(/kebab-case/)
    }
  })

  it('accepts the forms a component folder really uses', () => {
    for (const good of ['badge', 'icon-button', 'alert-dialog', 'tree-view']) {
      expect(() => readSlug(good), good).not.toThrow()
    }
  })
})

describe('what it writes', () => {
  const written = files(readSlug('icon-button'))
  const all = [...written.values()].join('\n')

  it('writes exactly the folder-contract files, and nothing outside it', () => {
    expect([...written.keys()].sort()).toEqual([
      'constants.ts',
      'dummy/basic.tsx',
      'index.tsx',
      'meta.ts',
      'schema.ts',
      'test/icon-button.test.tsx',
      'types.ts',
      'variants.ts',
    ])
  })

  it('names the component and its constants consistently', () => {
    expect(written.get('index.tsx')).toContain('export function IconButton(')
    expect(written.get('constants.ts')).toContain('ICON_BUTTON_DEFAULTS')
    expect(written.get('variants.ts')).toContain('iconButtonVariants')
  })

  it('reads the shared contracts rather than redeclaring them', () => {
    expect(written.get('constants.ts')).toContain("from '#shared/contracts/tone.js'")
    expect(written.get('constants.ts')).toContain("from '#shared/contracts/size.js'")
    expect(written.get('variants.ts')).toContain('TONE_CLASS')
  })

  it('uses the alias, so a new component never starts with a deep relative path', () => {
    expect(all).not.toMatch(/\.\.\/\.\./)
  })

  it('names no palette colour and no physical utility', () => {
    expect(all).not.toMatch(/-(slate|gray|zinc|stone|orange|yellow|lime|teal|blue|indigo|purple|pink|rose)-\d/)
    expect(all).not.toMatch(/(^|["'\s])(ml|mr|pl|pr)-/)
    expect(all).not.toMatch(/(^|["'\s])text-(left|right)(\s|["'])/)
  })

  it('carries the focus ring and the transition from the shared constants', () => {
    expect(written.get('variants.ts')).toContain('FOCUS_RING')
    expect(written.get('variants.ts')).toContain('TRANSITION')
  })

  it('puts zod only in the schema, so no component pulls it into the browser', () => {
    for (const [name, content] of written) {
      const runtimeZod = /^\s*import\s+(?!type\b)[^;]*from\s+'zod'/m.test(content)
      expect(runtimeZod, name).toBe(name === 'schema.ts')
    }
  })

  it('ships a test, so a scaffolded component is never untested', () => {
    expect(written.get('test/icon-button.test.tsx')).toContain('describe(')
    expect(written.get('test/icon-button.test.tsx')).toContain('expect(')
  })

  it('keeps every comment to one line, which R-5.12-3 requires', () => {
    for (const [name, content] of written) {
      const runs = content.split('\n').map((l) => l.trim().startsWith('//'))
      const adjacent = runs.some((isComment, i) => isComment && runs[i + 1] === true)
      expect(adjacent, name).toBe(false)
    }
  })
})
