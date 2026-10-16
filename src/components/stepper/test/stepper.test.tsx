import { describe, expect, it } from 'vitest'

import { getLabels } from '#shared/labels/get-labels.js'
import { attr, markup } from '#test/markup.js'
import * as entry from '../index.js'
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
/** The hidden word of each step, or null where it has none. */
const spoken = (out: string) => rows(out).map((row) => /<span class="sr-only">([^<]*)<\/span>/.exec(row)?.[1] ?? null)
/** What each circle holds: a tick, an x, or its number. */
const marks = (out: string) => rows(out).map((row) => {
  const inner = /<span aria-hidden="true" class="relative inline-flex[^"]*">(.*?)<\/span><\/div>/.exec(row)?.[1] ?? ''
  if (inner.includes('M229.66,77.66')) return 'tick'
  return inner.includes('M205.66,194.34') ? 'x' : inner
})
const CONNECTOR = 'absolute top-1/2'

describe('the element it renders', () => {
  it('is an ordered list with one item per step, in the order given', () => {
    expect(html()).toMatch(/^<ol data-size="md" class="flex w-full min-w-0 items-start \[--tc-stepper-mark:var\(--spacing-control-sm\)\]" role="list"><li /)
    expect(html()).toMatch(/<\/ol>$/)
    expect(rows(html())).toHaveLength(4)
  })

  it('writes the list role itself, which Safari with VoiceOver needs once the list style is gone', () => {
    expect(attr(html(), 'role')).toBe('list')
  })

  it('writes the role after the rest, so a caller cannot replace or remove it', () => {
    const replaced = { role: 'presentation' } as unknown as Partial<StepperProps>
    const removed = { role: undefined } as unknown as Partial<StepperProps>
    expect(attr(html(replaced), 'role')).toBe('list')
    expect(attr(html(removed), 'role')).toBe('list')
  })

  it('spreads the rest, style included, onto the list', () => {
    const out = html({ id: 'signup', 'aria-label': 'Sign-up', style: { opacity: 0.5 } })
    expect(out).toMatch(/^<ol [^>]*id="signup"/)
    expect(attr(out, 'aria-label')).toBe('Sign-up')
    expect(attr(out, 'style')).toBe('opacity:0.5')
  })

  it('reports its size as a value attribute, md by default', () => {
    expect(attr(html(), 'data-size')).toBe('md')
    expect(attr(html({ size: 'xl' }), 'data-size')).toBe('xl')
  })

  it('exports one component and nothing else', () => {
    expect(Object.keys(entry)).toEqual(['Stepper'])
  })

  it('never emits data-state, which R-5.7-6 bans, nor a labels or locale attribute', () => {
    expect(html()).not.toMatch(/data-state|labels=|locale=|\[object/)
  })
})

describe('four steps with the second as value', () => {
  it('the first holds a tick and says Completed', () => {
    const out = html()
    expect(marks(out)[0]).toBe('tick')
    expect(spoken(out)[0]).toBe('Completed')
  })

  it('the second is the current step, holds a 2 and says no word', () => {
    const [, second = ''] = rows(html())
    expect(attr(second, 'aria-current')).toBe('step')
    expect(marks(html())[1]).toBe('2')
    expect(spoken(html())[1]).toBeNull()
  })

  it('the last two hold their numbers and say Not started', () => {
    expect(marks(html()).slice(2)).toEqual(['3', '4'])
    expect(spoken(html()).slice(2)).toEqual(['Not started', 'Not started'])
  })

  it('reports each status as a value attribute, and only the current step as current', () => {
    expect(rows(html()).map((row) => attr(row, 'data-status'))).toEqual(['done', 'current', 'todo', 'todo'])
    expect(rows(html()).map((row) => attr(row, 'aria-current'))).toEqual([undefined, 'step', undefined, undefined])
  })
})

describe('the current step', () => {
  it('is the first step when no value is given', () => {
    const out = markup(<Stepper items={FOUR} />)
    expect(rows(out).map((row) => attr(row, 'data-status'))).toEqual(['current', 'todo', 'todo', 'todo'])
  })

  it('is no step when value names none: every step is todo and none is current', () => {
    const out = html({ value: 'missing' })
    expect(rows(out).map((row) => attr(row, 'data-status'))).toEqual(['todo', 'todo', 'todo', 'todo'])
    expect(out).not.toContain('aria-current')
    expect(marks(out)).toEqual(['1', '2', '3', '4'])
  })

  it('gives way to a step\'s own status, which wins over the one worked out from value', () => {
    const items: StepperItem[] = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B', status: 'error' },
      { id: 'c', title: 'C', status: 'done' },
      { id: 'd', title: 'D' },
    ]
    const out = markup(<Stepper items={items} value="c" />)
    expect(rows(out).map((row) => attr(row, 'data-status'))).toEqual(['done', 'error', 'done', 'todo'])
    expect(marks(out)).toEqual(['tick', 'x', 'tick', '4'])
    expect(spoken(out)).toEqual(['Completed', 'Needs attention', 'Completed', 'Not started'])
  })

  it('is still the current step when value names a step with a status of its own, which keeps its word', () => {
    const items: StepperItem[] = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B', status: 'error' },
      { id: 'c', title: 'C' },
    ]
    const out = markup(<Stepper items={items} value="b" />)
    expect(rows(out).map((row) => attr(row, 'data-status'))).toEqual(['done', 'error', 'todo'])
    expect(rows(out).map((row) => attr(row, 'aria-current'))).toEqual([undefined, 'step', undefined])
    expect(spoken(out)).toEqual(['Completed', 'Needs attention', 'Not started'])
  })
})

describe('the connector', () => {
  it('joins every step to the next and is absent on the last', () => {
    expect(rows(html()).map((row) => row.includes(CONNECTOR))).toEqual([true, true, true, false])
  })

  it('is absent on a single step, which has nothing to connect to', () => {
    expect(markup(<Stepper items={[{ id: 'a', title: 'Only' }]} />)).not.toContain(CONNECTOR)
  })

  it('carries data-done after a done step only, and is hidden from a screen reader', () => {
    const connectors = [...html().matchAll(/<span aria-hidden="true"( data-done="")? class="absolute/g)]
    expect(connectors.map((m) => m[1] !== undefined)).toEqual([true, false, false])
  })
})

describe('the circle and the title', () => {
  it('hides the circle, since the list gives the number and the word gives the state', () => {
    for (const row of rows(html())) expect(row).toMatch(/<span aria-hidden="true" class="relative inline-flex/)
  })

  it('writes the title in its own direction, under the circle', () => {
    const [first = ''] = rows(html())
    expect(first).toContain('</div><span dir="auto" class="max-w-full wrap-anywhere text-xs text-body">Account</span>')
  })

  it('puts the hidden word after the title, so it is heard as "Account, Completed"', () => {
    const [first = ''] = rows(html())
    expect(first).toContain('>Account</span><span class="sr-only">Completed</span></li>')
  })

  it('keeps a block title whole, with no paragraph that the parser would empty', () => {
    const out = markup(<Stepper items={[{ id: 'a', title: <div>Block</div> }]} />)
    expect(out).toContain('<span dir="auto" class="max-w-full wrap-anywhere text-xs font-semibold text-body"><div>Block</div></span>')
    expect(out).not.toContain('<p')
  })
})

describe('the words and the digits', () => {
  it('says each status in Arabic with the Arabic labels', () => {
    const out = markup(<Stepper items={FOUR} value="profile" {...getLabels('ar')} />)
    expect(spoken(out)).toEqual(['مكتمل', null, 'لم يبدأ', 'لم يبدأ'])
  })

  it('writes Latin digits for ar and Arabic-Indic ones for ar-u-nu-arab', () => {
    expect(marks(markup(<Stepper items={FOUR} value="profile" {...getLabels('ar')} />)).slice(1)).toEqual(['2', '3', '4'])
    expect(marks(markup(<Stepper items={FOUR} value="profile" {...getLabels('ar-u-nu-arab')} />)).slice(1))
      .toEqual(['٢', '٣', '٤'])
  })

  it('takes a reworded status from the labels', () => {
    const { labels } = getLabels('en', { stepper: { todo: 'Upcoming' } })
    expect(spoken(html({ labels }))).toEqual(['Completed', null, 'Upcoming', 'Upcoming'])
  })

  it('survives a locale tag no browser knows, in Latin digits', () => {
    expect(marks(html({ locale: 'not a locale' })).slice(1)).toEqual(['2', '3', '4'])
  })
})

describe('no steps', () => {
  it('renders nothing at all, not an empty list', () => {
    expect(markup(<Stepper items={[]} />)).toBe('')
  })
})
