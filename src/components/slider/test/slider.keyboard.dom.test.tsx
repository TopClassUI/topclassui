import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Slider } from '../index.js'

// The Authoring Practices slider (WCAG 2.5.7: every drag has a keyboard path). Each key is pressed from 50, step 5.
const DIRECTIONS = ['ltr', 'rtl'] as const

const thumb = (name: string) => screen.getByRole('slider', { name })
const now = (name: string) => thumb(name).getAttribute('aria-valuenow')

/** Focus a thumb at its start and press one key: the value it lands on. */
async function after(key: string, name = 'Volume') {
  thumb(name).focus()
  await userEvent.keyboard(key)
  return now(name)
}

for (const direction of DIRECTIONS) {
  describe(direction, () => {
    const page = (onValueChange?: (value: number) => void) => (
      <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
        <div dir={direction}>
          <Slider aria-label="Volume" defaultValue={50} step={5} onValueChange={onValueChange} />
        </div>
      </TopClassProvider>
    )
    // The track runs from the inline start: in RTL it starts at the right, so ArrowLeft raises the value.
    const [raise, lower] = direction === 'ltr' ? ['{ArrowRight}', '{ArrowLeft}'] : ['{ArrowLeft}', '{ArrowRight}']

    it(`${raise.slice(1, -1)} adds a step and ${lower.slice(1, -1)} takes one away`, async () => {
      render(page())
      expect(await after(raise)).toBe('55')
      expect(await after(`${lower}${lower}`)).toBe('45')
    })

    it('ArrowUp adds a step and ArrowDown takes one away, in both directions', async () => {
      render(page())
      expect(await after('{ArrowUp}')).toBe('55')
      expect(await after('{ArrowDown}{ArrowDown}')).toBe('45')
    })

    it('Page Up and Page Down, and Shift with an arrow, move by the large step of 10', async () => {
      render(page())
      expect(await after('{PageUp}')).toBe('60')
      expect(await after('{PageDown}{PageDown}')).toBe('40')
      expect(await after('{Shift>}{ArrowUp}{/Shift}')).toBe('50')
      expect(await after(`{Shift>}${raise}{/Shift}`)).toBe('60')
      expect(await after(`{Shift>}${lower}{/Shift}`)).toBe('50')
    })

    it('Home goes to min and End to max, and neither key passes them', async () => {
      render(page())
      expect(await after('{End}{ArrowUp}{PageUp}')).toBe('100')
      expect(await after('{Home}{ArrowDown}{PageDown}')).toBe('0')
    })

    it('each key calls onValueChange once with the new number, and Tab or a letter calls nothing', async () => {
      const onValueChange = vi.fn((value: number) => value)
      render(page(onValueChange))
      await after(`${raise}{End}a{Tab}`)
      expect(onValueChange.mock.calls.map((call) => call[0])).toEqual([55, 100])
    })
  })
}

describe('a range: two thumbs, each its own tab stop, that cannot cross', () => {
  const range = (direction: 'ltr' | 'rtl' = 'ltr') => (
    <TopClassProvider direction={direction} locale="en">
      <div dir={direction}>
        <Slider aria-label="Price" defaultValue={[20, 80]} step={5} />
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )

  it('Tab stops on Minimum, then Maximum, then leaves', async () => {
    render(range())
    await userEvent.tab()
    expect(document.activeElement).toBe(thumb('Minimum'))
    await userEvent.tab()
    expect(document.activeElement).toBe(thumb('Maximum'))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }))
  })

  it('End takes Minimum up to Maximum and no further; Home takes Maximum down to Minimum and no further', async () => {
    render(range())
    expect(await after('{End}{ArrowUp}{PageUp}', 'Minimum')).toBe('80')
    expect(now('Maximum')).toBe('80')
    expect(await after('{Home}{ArrowDown}', 'Maximum')).toBe('80')
  })

  it('each thumb moves alone: the other keeps its value', async () => {
    render(range())
    expect(await after('{ArrowUp}', 'Minimum')).toBe('25')
    expect(await after('{ArrowDown}', 'Maximum')).toBe('75')
    expect([now('Minimum'), now('Maximum')]).toEqual(['25', '75'])
  })

  it('rtl: ArrowLeft raises the thumb that has the focus', async () => {
    render(range('rtl'))
    expect(await after('{ArrowLeft}', 'Minimum')).toBe('25')
    expect(await after('{ArrowRight}', 'Maximum')).toBe('75')
  })
})

describe('without a provider the arrows keep their LTR meaning, whatever the dir', () => {
  it('ArrowRight in a dir="rtl" box with no provider adds a step', async () => {
    render(<div dir="rtl"><Slider aria-label="Volume" defaultValue={50} step={5} /></div>)
    expect(await after('{ArrowRight}')).toBe('55')
  })
})

describe('largeStep and minStepsBetweenValues are clamped (R-5.7-7), so the keyboard path always works', () => {
  for (const largeStep of [-10, 0, Number.NaN, 2]) {
    it(`a largeStep of ${String(largeStep)} becomes the step: Page Up and Shift with an arrow still raise the value`, async () => {
      render(<Slider aria-label="Volume" defaultValue={50} step={5} largeStep={largeStep} />)
      expect(await after('{PageUp}')).toBe('55')
      expect(await after('{Shift>}{ArrowRight}{/Shift}')).toBe('60')
      expect(await after('{PageDown}')).toBe('55')
    })
  }

  it('a largeStep past a quadrillion stops at it, and Page Up goes to max', async () => {
    render(<Slider aria-label="Volume" defaultValue={50} largeStep={1e300} />)
    expect(await after('{PageUp}')).toBe('100')
  })

  for (const gap of [-5, Number.NaN]) {
    it(`a minStepsBetweenValues of ${String(gap)} becomes 0: the two thumbs of a range meet and never cross`, async () => {
      render(<Slider aria-label="Price" defaultValue={[20, 80]} minStepsBetweenValues={gap} />)
      expect(await after('{End}', 'Minimum')).toBe('80')
      expect(await after('{ArrowRight}', 'Minimum')).toBe('80')
    })
  }
})
