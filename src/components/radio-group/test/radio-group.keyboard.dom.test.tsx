import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { RadioGroupItem, RadioGroupRoot } from '../index.js'
import { useChromiumLabels } from './chromium-labels.js'

useChromiumLabels()

// The Authoring Practices radio group: one tab stop, the arrows move and select and wrap, Space selects.
const DIRECTIONS = ['ltr', 'rtl'] as const

function Page({ direction, onValueChange, defaultValue = 'b' }: { direction: 'ltr' | 'rtl', onValueChange?: (next: string) => void, defaultValue?: string }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div dir={direction}>
        <button type="button">Before</button>
        <RadioGroupRoot aria-label="Letters" defaultValue={defaultValue} onValueChange={onValueChange}>
          <RadioGroupItem value="a">A</RadioGroupItem>
          <RadioGroupItem value="b">B</RadioGroupItem>
          <RadioGroupItem value="c" disabled>C</RadioGroupItem>
          <RadioGroupItem value="d">D</RadioGroupItem>
        </RadioGroupRoot>
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )
}

const radio = (name: string) => screen.getByRole('radio', { name })
const checked = () => screen.getAllByRole('radio').filter((one) => one.getAttribute('aria-checked') === 'true').map((one) => one.textContent || one.closest('label')?.textContent)
const focused = () => document.activeElement?.closest('label')?.textContent ?? document.activeElement?.textContent

/** Focus the radio of a letter, press keys, and report where the focus and the check are. */
async function press(name: string, keys: string) {
  radio(name).focus()
  await userEvent.keyboard(keys)
  return { focus: focused(), checked: checked() }
}

for (const direction of DIRECTIONS) {
  const [forward, back] = direction === 'ltr' ? ['{ArrowRight}', '{ArrowLeft}'] : ['{ArrowLeft}', '{ArrowRight}']

  describe(direction, () => {
    it('Tab enters on the checked radio and the next Tab leaves the group', async () => {
      render(<Page direction={direction} />)
      await userEvent.tab()
      expect(focused()).toBe('Before')
      await userEvent.tab()
      expect(document.activeElement).toBe(radio('B'))
      await userEvent.tab()
      expect(focused()).toBe('After')
      await userEvent.tab({ shift: true })
      expect(document.activeElement).toBe(radio('B'))
    })

    it('ArrowDown moves to the next radio and selects it, skipping a disabled one', async () => {
      const onValueChange = vi.fn((next: string) => next)
      render(<Page direction={direction} onValueChange={onValueChange} />)
      expect(await press('B', '{ArrowDown}')).toEqual({ focus: 'D', checked: ['D'] })
      expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['d'])
    })

    it('ArrowUp moves to the radio before and selects it', async () => {
      render(<Page direction={direction} />)
      expect(await press('B', '{ArrowUp}')).toEqual({ focus: 'A', checked: ['A'] })
    })

    it(`${forward.slice(1, -1)} is the next radio in reading order, ${back.slice(1, -1)} the one before`, async () => {
      render(<Page direction={direction} />)
      expect(await press('B', forward)).toEqual({ focus: 'D', checked: ['D'] })
      expect(await press('D', back)).toEqual({ focus: 'B', checked: ['B'] })
    })

    it('the arrows wrap at both ends', async () => {
      render(<Page direction={direction} />)
      expect(await press('D', '{ArrowDown}')).toEqual({ focus: 'A', checked: ['A'] })
      expect(await press('A', '{ArrowUp}')).toEqual({ focus: 'D', checked: ['D'] })
      expect(await press('D', forward)).toEqual({ focus: 'A', checked: ['A'] })
      expect(await press('A', back)).toEqual({ focus: 'D', checked: ['D'] })
    })

    it('Space selects the focused radio; Enter, Home and End do nothing', async () => {
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
  it('ArrowRight in a dir="rtl" box with no provider moves to the next radio', async () => {
    render(
      <div dir="rtl">
        <RadioGroupRoot aria-label="Letters" defaultValue="a">
          <RadioGroupItem value="a">A</RadioGroupItem>
          <RadioGroupItem value="b">B</RadioGroupItem>
        </RadioGroupRoot>
      </div>,
    )
    expect(await press('A', '{ArrowRight}')).toEqual({ focus: 'B', checked: ['B'] })
  })
})
