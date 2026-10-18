import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'

import { foldersWithoutKeyboardSpec } from './keyboard.js'

// R-5.6-1: every interactive component has its own e2e/keyboard-<slug>.spec.ts. A folder without one needs a reason here,
// and a spec of its own always counts.

const NO_FOCUS = 'takes no focus: nothing in it is interactive'

const NO_KEYBOARD_SPEC: Readonly<Record<string, string>> = {
  'alert': NO_FOCUS,
  'avatar': NO_FOCUS,
  'avatar-group': NO_FOCUS,
  'badge': NO_FOCUS,
  'card': NO_FOCUS,
  'empty-state': NO_FOCUS,
  'icon': NO_FOCUS,
  'icon-registry': NO_FOCUS,
  'kbd': NO_FOCUS,
  'meter': NO_FOCUS,
  'progress': NO_FOCUS,
  'separator': NO_FOCUS,
  'skeleton': NO_FOCUS,
  'spinner': NO_FOCUS,
  'stepper': NO_FOCUS,
  'svg': NO_FOCUS,
  'timeline': NO_FOCUS,
  'button': 'a native button, outside the keyboard checks: the browser owns its keys, and focus-ring.spec reads its ring',
  'input': 'a native input, outside the keyboard checks: the browser owns its keys',
  'table': 'outside the keyboard checks: its one stop is the scroll container, which scroll-tab-stop.spec proves',
}

test('every component folder has its own keyboard spec or a reason for having none', () => {
  expect(foldersWithoutKeyboardSpec(process.cwd(), NO_KEYBOARD_SPEC)).toEqual([])
})

test('each of the ten interactive components of Unit 4 has a keyboard spec of its own, and no reason stands in for one', () => {
  const unit4 = ['checkbox', 'combobox', 'number-field', 'otp-field', 'radio-group', 'segmented-control', 'select', 'slider', 'switch', 'textarea']
  expect(foldersWithoutKeyboardSpec(process.cwd(), {}).filter((slug) => unit4.includes(slug))).toEqual([])
  expect(unit4.filter((slug) => slug in NO_KEYBOARD_SPEC)).toEqual([])
})

test('a folder with no spec and no reason is reported; its own spec or a reason is proof', () => {
  const root = mkdtempSync(join(tmpdir(), 'tc-keyboard-'))
  try {
    for (const slug of ['own-spec', 'reasoned', 'both', 'neither']) mkdirSync(join(root, 'src', 'components', slug), { recursive: true })
    mkdirSync(join(root, 'e2e'))
    for (const slug of ['own-spec', 'both']) writeFileSync(join(root, 'e2e', `keyboard-${slug}.spec.ts`), '')
    writeFileSync(join(root, 'src', 'components', 'README.md'), '')
    expect(foldersWithoutKeyboardSpec(root, { reasoned: NO_FOCUS, both: NO_FOCUS })).toEqual(['neither'])
    expect(foldersWithoutKeyboardSpec(root, {})).toEqual(['neither', 'reasoned'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
