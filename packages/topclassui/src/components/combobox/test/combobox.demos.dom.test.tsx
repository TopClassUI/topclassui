import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** What each input shows once its first enabled option has been chosen by the keyboard: a disabled one keeps its value,
 * a read-only one too, and one with no options stays empty. Written out, so the demo and the expectation cannot drift. */
const AFTER: Record<string, string[]> = {
  'basic': ['Next.js'],
  'form': ['Next.js'],
  'load-more': ['Result 1'],
  'long-content': ['Supercalifragilistic'.repeat(15), 'Supercalifragilistic'.repeat(15)],
  'playground': ['Next.js'],
  'rtl': ['عمّان'],
  'sizes': ['Apple', 'Apple', 'Apple', 'Apple', 'Apple'],
  'states': ['Jordan', 'Jordan', 'Jordan', '', 'Jordan', '', 'Jordan', 'Saudi Arabia', 'Jordan'],
  'status': ['', 'Aleppo'],
  'ten-thousand': ['Option 1'],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default
const shown = () => screen.getAllByRole('combobox').map((one) => (one as HTMLInputElement).value)

describe('every demo, in the browser, does what its Combobox names', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: emptied, opened, ArrowDown and Enter choose the first option, except where it is disabled or read-only`, async () => {
      const Demo = await load(name)
      render(<Demo />)
      for (const input of screen.getAllByRole<HTMLInputElement>('combobox')) {
        if (input.disabled || input.readOnly) continue
        await userEvent.clear(input)
        // Enter closes the list; an Escape on the closed input would clear the value (Base UI's).
        await userEvent.keyboard('{ArrowDown}{Enter}')
        await waitFor(() => { expect(input.getAttribute('aria-expanded')).toBe('false') })
      }
      expect(shown(), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  const sent = () => [...new FormData(document.querySelector('form') as HTMLFormElement).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

  it('form: framework=next, then framework=astro once Astro is chosen', async () => {
    const Demo = await load('form')
    render(<Demo />)
    expect(sent()).toEqual([['framework', 'next']])
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'Astro' }))
    expect(sent()).toEqual([['framework', 'astro']])
  })
})
