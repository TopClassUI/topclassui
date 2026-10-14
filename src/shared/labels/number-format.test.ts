import { describe, expect, it } from 'vitest'

import { createNumberFormat } from './get-labels.js'

describe('createNumberFormat reads the tag when no numbering system is passed', () => {
  it('keeps Latin digits for a bare ar', () => {
    expect(createNumberFormat('ar').format(1234)).toBe('1,234')
  })

  it('writes Arabic-Indic digits for ar-u-nu-arab', () => {
    expect(createNumberFormat('ar-u-nu-arab').format(1234)).toBe('١٬٢٣٤')
  })

  it('writes Latin digits for ar-u-nu-latn', () => {
    expect(createNumberFormat('ar-u-nu-latn').format(1234)).toBe('1,234')
  })

  it('finds the extension among other keys', () => {
    expect(createNumberFormat('ar-u-ca-islamic-nu-arab').format(1234)).toBe('١٬٢٣٤')
  })

  it('keeps Latin digits for en', () => {
    expect(createNumberFormat('en').format(1234)).toBe('1,234')
  })
})

describe('an explicit numbering system still wins over the tag', () => {
  it('latn over ar-u-nu-arab', () => {
    expect(createNumberFormat('ar-u-nu-arab', 'latn').format(1234)).toBe('1,234')
  })

  it('arab over ar-u-nu-latn', () => {
    expect(createNumberFormat('ar-u-nu-latn', 'arab').format(1234)).toBe('١٬٢٣٤')
  })

  it('arab over a bare en', () => {
    expect(createNumberFormat('en', 'arab').format(1234)).toBe('١٬٢٣٤')
  })
})
