import { describe, expect, it } from 'vitest'

import { addLineOf, importLineOf, installLineOf, sourceImportLineOf, versionLabelOf } from './install'

describe('installLineOf', () => {
  it('installs the beta tag while the version is a prerelease', () => {
    expect(installLineOf('0.1.0-beta.0')).toBe('npm i topclassui@beta zod')
    expect(installLineOf('0.1.0')).toBe('npm i topclassui zod')
  })
})

describe('versionLabelOf', () => {
  it('names the prerelease tag in words', () => {
    expect(versionLabelOf('0.1.0-beta.2')).toBe('v0.1.0 beta')
    expect(versionLabelOf('1.0.0')).toBe('v1.0.0')
  })
})

describe('importLineOf', () => {
  it('imports every part from the component subpath', () => {
    expect(importLineOf(['SegmentedControlRoot', 'SegmentedControlItem'], 'segmented-control'))
      .toBe("import { SegmentedControlRoot, SegmentedControlItem } from 'topclassui/segmented-control'")
  })
})

describe('the copy-the-source pair', () => {
  it('adds one component with the CLI and imports it through the @/topclassui alias', () => {
    expect(addLineOf('date-picker')).toBe('npx topclassui add date-picker')
    expect(sourceImportLineOf(['DialogRoot', 'DialogBody'], 'dialog'))
      .toBe("import { DialogRoot, DialogBody } from '@/topclassui/components/dialog'")
  })
})
