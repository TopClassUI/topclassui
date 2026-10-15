import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** The label of each control, as the browser's accessibility tree names it once mounted: role and name. */
const NAMED: Record<string, string[]> = {
  'basic': ['textbox Email'],
  'controls': [
    'textbox Email', 'textbox Bio', 'checkbox Terms', 'switch Digest', 'radiogroup Plan', 'radiogroup View', 'slider Volume',
    'textbox Guests', 'textbox Code', 'combobox Country', 'combobox City',
  ],
  'form': ['textbox Email', 'textbox Message', 'checkbox I accept the terms'],
  'group': ['radiogroup Plan'],
  'hint-error': ['textbox Username', 'textbox About you', 'textbox Website'],
  'inline': ['checkbox Send me product news', 'switch Weekly digest'],
  'live': ['textbox Nickname', 'combobox Size'],
  'long-content': [`textbox ${'x'.repeat(300)}`, `checkbox ${'A label long enough to wrap onto several lines on any phone, '.repeat(5).trim()}`],
  'required': ['textbox Email', 'checkbox I accept the terms'],
  'rtl': ['textbox البريد الإلكتروني', 'checkbox أوافق على الشروط'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

describe('every demo, mounted, names each control by its label', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(NAMED).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: each control is found by its role and the label's text`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const line of NAMED[name] ?? []) {
        const [role = '', ...words] = line.split(' ')
        expect(screen.getAllByRole(role as 'textbox', { name: words.join(' ') }), line).toHaveLength(1)
      }
    })
  }
})
