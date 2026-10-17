import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What a paste of 4821930ab into the tab stop of every field of a demo leaves in it: a live field fills from its
 * tab stop to its length, a numeric one drops the letters, and a disabled or read-only one keeps its default. */
const AFTER: Record<string, string[]> = {
  'basic': ['482193'],
  'form': ['482193'],
  'grouped': ['482193'],
  'long': ['4821930ab'],
  'rtl': ['482193'],
  'sizes': ['482482', '482482', '482482', '482482', '482482'],
  'skeleton': ['482193', '482193', '482193', '482193', '482193', '4821', '482193', '4821930'],
  'states': ['482914', '482', '482913'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const groups = () => [...document.querySelectorAll('[role="group"]')]
const code = (group: Element) => [...group.querySelectorAll('input')].map((cell) => cell.value).join('')

describe('every demo, in the browser, does what its fields name', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a paste into each field fills the live ones from the tab stop, and leaves a disabled or read-only one`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const group of groups()) {
        const stop = group.querySelector('input[tabindex="0"]') as HTMLInputElement
        stop.focus()
        await userEvent.paste('4821930ab')
      }
      expect(groups().map(code), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: code= at first, then the code typed so far', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['code', '']])
    ;(document.querySelector('input') as HTMLInputElement).focus()
    await userEvent.keyboard('48')
    expect(sent()).toEqual([['code', '48']])
  })
})
