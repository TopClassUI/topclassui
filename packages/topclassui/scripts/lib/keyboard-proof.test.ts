import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { NO_FOCUS, UNIT_5, keyboardProblems, proofOf, takesFocus } from './keyboard-proof.js'

const ROOT = process.cwd()

describe('R-5.6-1: every component of Unit 5 that takes the focus has a keyboard spec', () => {
  it('Unit 5 builds these eight, and each is a component folder', () => {
    expect(UNIT_5).toEqual(['meter', 'stepper', 'code-block', 'field', 'form', 'file-upload', 'tree-view', 'date-picker'])
    expect(UNIT_5.filter((slug) => !existsSync(join(ROOT, 'src', 'components', slug, 'meta.ts')))).toEqual([])
  })

  it('each one is proven by a spec or excused, and only Meter and Stepper are excused', () => {
    expect(keyboardProblems(ROOT, UNIT_5)).toEqual([])
    expect(Object.keys(NO_FOCUS)).toEqual(['meter', 'stepper'])
    expect(['code-block', 'field', 'form', 'file-upload', 'tree-view', 'date-picker'].map((slug) => proofOf(ROOT, slug))).toEqual([
      'keyboard-code-block.spec.ts', 'keyboard-field.spec.ts', 'keyboard-form.spec.ts', 'keyboard-file-upload.spec.ts',
      'keyboard-tree-view.spec.ts', 'keyboard-date-picker.spec.ts',
    ])
  })

  it('a component\'s own spec is proof too: Input and Table, of Unit 2, press keys and read the ring in theirs', () => {
    expect([proofOf(ROOT, 'input'), proofOf(ROOT, 'table')]).toEqual(['input.spec.ts', 'table.spec.ts'])
  })
})

describe('keyboardProblems fails on each case it exists to catch', () => {
  let root = ''
  afterEach(() => { rmSync(root, { recursive: true, force: true }) })

  /** A repository with the given files, each path relative to its root. */
  const repo = (files: Record<string, string>) => {
    root = mkdtempSync(join(tmpdir(), 'tc-keys-'))
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), text)
    }
    return root
  }

  it('names an interactive component with no spec, or with a spec that never reads the ring', () => {
    repo({
      'src/components/dial/client.tsx': '',
      'src/components/knob/index.tsx': 'export const Knob = () => <button type="button" />',
      'e2e/knob.spec.ts': "await page.keyboard.press('Tab')",
    })
    expect(keyboardProblems(root, ['dial', 'knob'], {})).toEqual([
      'dial: no e2e/keyboard-dial.spec.ts or e2e/dial.spec.ts presses a key and calls expectRing',
      'knob: no e2e/keyboard-knob.spec.ts or e2e/knob.spec.ts presses a key and calls expectRing',
    ])
    writeFileSync(join(root, 'e2e', 'knob.spec.ts'), "await page.keyboard.press('Tab')\nawait expectRing(page, 'knob')")
    expect(keyboardProblems(root, ['knob'], {})).toEqual([])
  })

  it('names a component excused as taking no focus once it takes it, and one with no focus and no reason', () => {
    repo({
      'src/components/gauge/index.tsx': 'export const Gauge = () => <div tabIndex={0} />',
      'src/components/badge/index.tsx': 'export const Badge = () => <span />',
      'src/components/badge/dummy/basic.tsx': 'export default () => <button type="button" />',
    })
    expect([takesFocus(join(root, 'src/components/gauge')), takesFocus(join(root, 'src/components/badge'))]).toEqual([true, false])
    expect(keyboardProblems(root, ['gauge', 'badge'], { gauge: 'read only' })).toEqual([
      'gauge: excused as taking no focus, and it now does',
      'badge: takes no focus and has no reason in NO_FOCUS',
    ])
  })
})
