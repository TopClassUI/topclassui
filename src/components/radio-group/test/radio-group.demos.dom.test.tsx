import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { useChromiumLabels } from './chromium-labels.js'

useChromiumLabels()

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a click on the text of every radio of a demo, in document order, leaves checked: in each group the last live
 * radio; a disabled or read-only group keeps its default, and a disabled radio is never picked. */
const AFTER: Record<string, string[]> = {
  'basic': ['Lifetime'],
  'form': ['Team'],
  'horizontal': ['Extra large'],
  'long-content': ['Pick up'],
  'playground': ['Lifetime'],
  'rtl': ['مدى الحياة'],
  'sizes': ['Off', 'Off', 'Off', 'Off', 'Off'],
  'states': ['Invalid', 'Disabled, checked', 'Live', 'Read-only, checked'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const checkedTexts = () => screen.getAllByRole('radio').filter((one) => one.getAttribute('aria-checked') === 'true')
  .map((one) => one.closest('label')?.textContent.trim())

describe('every demo, in the browser, does what its radios name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a click on each text selects the live radios, and leaves a disabled or read-only one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const control of screen.getAllByRole('radio')) await userEvent.click(control.closest('label') as HTMLLabelElement)
      expect(checkedTexts(), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: plan=pro, then plan=free once Free is pressed', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['plan', 'pro']])
    await userEvent.click(screen.getByRole('radio', { name: 'Free' }))
    expect(sent()).toEqual([['plan', 'free']])
  })
})
