import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

// The Authoring Practices radio group: one tab stop, the arrows move and select and wrap, Space selects.
const DIRECTIONS = ['ltr', 'rtl'] as const

function Page({ direction, onValueChange }: { direction: 'ltr' | 'rtl', onValueChange?: (next: string) => void }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div dir={direction}>
        <button type="button">Before</button>
        <SegmentedControlRoot aria-label="Letters" defaultValue="b" onValueChange={onValueChange}>
          <SegmentedControlItem value="a">A</SegmentedControlItem>
          <SegmentedControlItem value="b">B</SegmentedControlItem>
          <SegmentedControlItem value="c" disabled>C</SegmentedControlItem>
          <SegmentedControlItem value="d">D</SegmentedControlItem>
        </SegmentedControlRoot>
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )
}

const segment = (name: string) => screen.getByRole('radio', { name })
const checked = () => screen.getAllByRole('radio').filter((one) => one.getAttribute('aria-checked') === 'true').map((one) => one.textContent)
const focused = () => document.activeElement?.textContent

/** Focus the segment of a letter, press keys, and report where the focus and the selection are. */
async function press(name: string, keys: string) {
  segment(name).focus()
  await userEvent.keyboard(keys)
  return { focus: focused(), checked: checked() }
}

for (const direction of DIRECTIONS) {
  const [forward, back] = direction === 'ltr' ? ['{ArrowRight}', '{ArrowLeft}'] : ['{ArrowLeft}', '{ArrowRight}']

  describe(direction, () => {
    it('Tab enters on the selected segment and the next Tab leaves the track', async () => {
      render(<Page direction={direction} />)
      await userEvent.tab()
      expect(focused()).toBe('Before')
      await userEvent.tab()
      expect(document.activeElement).toBe(segment('B'))
      await userEvent.tab()
      expect(focused()).toBe('After')
      await userEvent.tab({ shift: true })
      expect(document.activeElement).toBe(segment('B'))
    })

    it(`${forward.slice(1, -1)} is the next segment in reading order and selects it, skipping a disabled one`, async () => {
      const onValueChange = vi.fn((next: string) => next)
      render(<Page direction={direction} onValueChange={onValueChange} />)
      expect(await press('B', forward)).toEqual({ focus: 'D', checked: ['D'] })
      expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['d'])
    })

    it(`${back.slice(1, -1)} is the segment before`, async () => {
      render(<Page direction={direction} />)
      expect(await press('B', back)).toEqual({ focus: 'A', checked: ['A'] })
    })

    it('ArrowDown and ArrowUp move as the next and the one before', async () => {
      render(<Page direction={direction} />)
      expect(await press('B', '{ArrowDown}')).toEqual({ focus: 'D', checked: ['D'] })
      expect(await press('D', '{ArrowUp}')).toEqual({ focus: 'B', checked: ['B'] })
    })

    it('the arrows wrap at both ends', async () => {
      render(<Page direction={direction} />)
      expect(await press('D', forward)).toEqual({ focus: 'A', checked: ['A'] })
      expect(await press('A', back)).toEqual({ focus: 'D', checked: ['D'] })
      expect(await press('D', '{ArrowDown}')).toEqual({ focus: 'A', checked: ['A'] })
      expect(await press('A', '{ArrowUp}')).toEqual({ focus: 'D', checked: ['D'] })
    })

    it('Space selects the focused segment; Enter, Home and End do nothing', async () => {
      const onValueChange = vi.fn((next: string) => next)
      render(<Page direction={direction} onValueChange={onValueChange} />)
      expect(await press('A', '{Enter}{Home}{End}')).toEqual({ focus: 'A', checked: ['B'] })
      expect(onValueChange).not.toHaveBeenCalled()
      expect(await press('A', ' ')).toEqual({ focus: 'A', checked: ['A'] })
      expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['a'])
    })
  })
}

describe('without a provider the arrows keep their LTR meaning, whatever the dir', () => {
  it('ArrowRight in a dir="rtl" box with no provider moves to the next segment', async () => {
    render(
      <div dir="rtl">
        <SegmentedControlRoot aria-label="Letters" defaultValue="a">
          <SegmentedControlItem value="a">A</SegmentedControlItem>
          <SegmentedControlItem value="b">B</SegmentedControlItem>
        </SegmentedControlRoot>
      </div>,
    )
    expect(await press('A', '{ArrowRight}')).toEqual({ focus: 'B', checked: ['B'] })
  })
})
