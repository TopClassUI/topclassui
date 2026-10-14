import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '../index.js'

// The Authoring Practices spin button, the same in both directions: ArrowUp increases, ArrowDown decreases.
const DIRECTIONS = ['ltr', 'rtl'] as const

function Page({ direction }: { direction: 'ltr' | 'rtl' }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div dir={direction}>
        <button type="button">Before</button>
        <NumberField aria-label="Guests" defaultValue={5} min={1} max={40} />
        <NumberField aria-label="Open" defaultValue={5} />
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )
}

const input = (name: string) => screen.getByRole<HTMLInputElement>('textbox', { name })
const keys = async (name: string, sequence: string) => {
  input(name).focus()
  await userEvent.keyboard(sequence)
  return input(name).value
}

for (const direction of DIRECTIONS) {
  describe(direction, () => {
    it('Tab goes from the button before to each input in turn and then on: no stepper is a stop', async () => {
      render(<Page direction={direction} />)
      const stops: string[] = []
      for (let press = 0; press < 4; press++) {
        await userEvent.tab()
        const active = document.activeElement as HTMLElement
        stops.push(active.getAttribute('aria-label') ?? active.textContent)
      }
      expect(stops).toEqual(['Before', 'Guests', 'Open', 'After'])
    })

    it('ArrowUp adds a step and ArrowDown takes one away', async () => {
      render(<Page direction={direction} />)
      expect(await keys('Guests', '{ArrowUp}{ArrowUp}')).toBe('7')
      expect(await keys('Guests', '{ArrowDown}')).toBe('6')
    })

    it('with Shift they move by 10, with Alt by 0.1', async () => {
      render(<Page direction={direction} />)
      expect(await keys('Guests', '{Shift>}{ArrowUp}{/Shift}')).toBe('15')
      expect(await keys('Guests', '{Alt>}{ArrowDown}{/Alt}')).toBe('14.9')
    })

    it('Home goes to min and End to max', async () => {
      render(<Page direction={direction} />)
      expect(await keys('Guests', '{End}')).toBe('40')
      expect(await keys('Guests', '{Home}')).toBe('1')
    })

    it('with no min or max, Home and End are left to the caret and the value stays', async () => {
      render(<Page direction={direction} />)
      expect(await keys('Open', '{Home}{End}')).toBe('5')
    })

    it('Page Up and Page Down are not built: the value stays (APG lists them as optional)', async () => {
      render(<Page direction={direction} />)
      expect(await keys('Guests', '{PageUp}{PageDown}')).toBe('5')
    })

    it('ArrowUp stops at max and ArrowDown at min', async () => {
      render(<Page direction={direction} />)
      expect(await keys('Guests', '{End}{ArrowUp}')).toBe('40')
      expect(await keys('Guests', '{Home}{ArrowDown}')).toBe('1')
    })
  })
}
