import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a press on each switch of each demo leaves it at, in document order: a disabled or read-only one stays. */
const AFTER: Record<string, string[]> = {
  'basic': ['false', 'true'],
  'form': ['false'],
  'playground': ['false'],
  'rtl': ['false', 'true'],
  'sizes': ['false', 'false', 'false', 'false', 'false'],
  'combined': ['true', 'false', 'true', 'false', 'false', 'true', 'true'],
  'stage': ['true', 'false'],
  'states': ['true', 'false', 'true', 'true', 'false', 'true'],
  'unchecked-value': ['true'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

describe('every demo, in the browser, does what its switches name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a click on each switch toggles the live ones and leaves a disabled or read-only one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const control of screen.getAllByRole('switch')) await userEvent.click(control)
      expect(screen.getAllByRole('switch').map((control) => control.getAttribute('aria-checked')), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demos send what they show', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: digest=on, then nothing once it is off', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['digest', 'on']])
    await userEvent.click(screen.getByRole('switch'))
    expect(sent()).toEqual([])
  })

  it('unchecked-value: news=no while it is off, news=yes once it is on', async () => {
    const Demo = await load('unchecked-value')
    render(<Demo />)
    expect(sent()).toEqual([['news', 'no']])
    await userEvent.click(screen.getByRole('switch'))
    expect(sent()).toEqual([['news', 'yes']])
  })
})
