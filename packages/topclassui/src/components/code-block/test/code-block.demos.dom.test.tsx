import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Every demo has one copy button, or none where it writes null; states has one per block that shows it. */
const BUTTONS: Record<string, number> = { states: 2 }

/** What a press of each demo's button writes to the clipboard: its first line, or null where there is no button. */
const WRITES: Record<string, string | null> = {
  'basic': 'export default async function Page() {',
  'highlighted': "import { CodeBlock } from 'topclassui/code-block'",
  'long-line': "const token = 'a1b2c3d4e5",
  'no-copy': null,
  'no-header': null,
  'playground': '<Button variant="solid" size="md">',
  'rtl': 'export default async function Page() {',
  'states': '<Button/>',
  'wrap': "export const columns = ['number'",
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

afterEach(() => { vi.restoreAllMocks() })

describe('every demo, in the browser, copies what it shows', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(WRITES).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: the button writes the whole code, which starts as the demo starts`, async () => {
      const writeText = vi.fn(() => Promise.resolve())
      Object.defineProperty(navigator, 'clipboard', { configurable: true, get: () => ({ writeText }) })
      const Demo = await load(name)
      render(<Demo />)
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length, name).toBe(WRITES[name] === null ? 0 : BUTTONS[name] ?? 1)
      if (buttons[0] === undefined) return
      await act(async () => { fireEvent.click(buttons[0] as HTMLElement); await Promise.resolve() })
      const written = writeText.mock.calls[0] as unknown as [string] | undefined
      expect(written?.[0].startsWith(WRITES[name] ?? '?'), name).toBe(true)
      expect(written?.[0], name).toBe(document.querySelector('code')?.textContent)
    })
  }
})
