import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Stepper } from '../index.js'
import type { StepperItem, StepperProps } from '../types.js'

const FOUR: StepperItem[] = [
  { id: 'account', title: 'Account' },
  { id: 'profile', title: 'Profile' },
  { id: 'team', title: 'Team' },
  { id: 'done', title: 'Done' },
]

const html = (props: Partial<StepperProps> = {}) => markup(<Stepper items={FOUR} value="profile" {...props} />)
/** One string per step, each starting at its own attributes. */
const rows = (out: string) => out.split('<li ').slice(1)

describe('a disabled step', () => {
  it('carries data-disabled and keeps its status, while the others carry none', () => {
    const out = html({ items: [...FOUR.slice(0, 3), { id: 'done', title: 'Done', disabled: true }] })
    expect(rows(out).map((row) => attr(`<li ${row}`, 'data-disabled'))).toEqual([undefined, undefined, undefined, ''])
    expect(rows(out).map((row) => attr(`<li ${row}`, 'data-status'))).toEqual(['done', 'current', 'todo', 'todo'])
  })

  it('writes no data-disabled for disabled={false}', () => {
    expect(html({ items: [{ id: 'a', title: 'A', disabled: false }] })).not.toContain('data-disabled=')
  })
})
