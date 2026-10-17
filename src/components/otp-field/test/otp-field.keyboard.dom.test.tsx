import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField } from '../index.js'

// The keys of Base UI's OTP field, in both directions: a code reads left to right, so every arrow keeps its LTR meaning.
const DIRECTIONS = ['ltr', 'rtl'] as const

function Page({ direction, defaultValue = '' }: { direction: 'ltr' | 'rtl', defaultValue?: string }) {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div dir={direction}>
        <button type="button">Before</button>
        <OTPField aria-labelledby="none" length={4} defaultValue={defaultValue} />
        <button type="button">After</button>
      </div>
    </TopClassProvider>
  )
}

const cells = () => [...document.querySelectorAll('[role="group"] input')] as HTMLInputElement[]
const shown = () => cells().map((cell) => cell.value || '_').join('')
const where = () => {
  const at = cells().indexOf(document.activeElement as HTMLInputElement)
  return at === -1 ? document.activeElement?.textContent ?? '' : at
}

/** Focus a cell, press keys, and report the code and the focused cell. */
async function press(cell: number, keys: string) {
  cells()[cell]?.focus()
  await userEvent.keyboard(keys)
  return { code: shown(), at: where() }
}

for (const direction of DIRECTIONS) {
  describe(direction, () => {
    it('Tab enters on the one tab stop, the first empty cell, and the next Tab leaves the field', async () => {
      render(<Page direction={direction} defaultValue="12" />)
      await userEvent.tab()
      await userEvent.tab()
      expect(where()).toBe(2)
      await userEvent.tab()
      expect(where()).toBe('After')
      await userEvent.tab({ shift: true })
      expect(where()).toBe(2)
    })

    it('a character fills the cell and moves to the next; at the last cell the focus stays', async () => {
      render(<Page direction={direction} />)
      expect(await press(0, '12')).toEqual({ code: '12__', at: 2 })
      expect(await press(2, '34')).toEqual({ code: '1234', at: 3 })
    })

    it('ArrowLeft goes to the cell before and ArrowRight to the cell after, in every direction', async () => {
      render(<Page direction={direction} defaultValue="1234" />)
      expect(await press(2, '{ArrowLeft}')).toEqual({ code: '1234', at: 1 })
      expect(await press(1, '{ArrowRight}{ArrowRight}')).toEqual({ code: '1234', at: 3 })
      expect(await press(0, '{ArrowLeft}')).toEqual({ code: '1234', at: 0 })
      expect(await press(3, '{ArrowRight}')).toEqual({ code: '1234', at: 3 })
    })

    it('Home and ArrowUp go to the first cell; End and ArrowDown to the first empty one, or the last', async () => {
      render(<Page direction={direction} defaultValue="12" />)
      expect(await press(2, '{Home}')).toEqual({ code: '12__', at: 0 })
      expect(await press(1, '{ArrowUp}')).toEqual({ code: '12__', at: 0 })
      expect(await press(0, '{End}')).toEqual({ code: '12__', at: 2 })
      expect(await press(0, '{ArrowDown}')).toEqual({ code: '12__', at: 2 })
    })

    it('Backspace clears the cell, and on an empty cell clears the one before and moves back to it', async () => {
      render(<Page direction={direction} defaultValue="123" />)
      expect(await press(2, '{Backspace}')).toEqual({ code: '12__', at: 1 })
      expect(await press(2, '{Backspace}')).toEqual({ code: '1___', at: 1 })
    })

    it('Delete removes the character of the cell and the code closes up; Control with Backspace clears it all', async () => {
      render(<Page direction={direction} defaultValue="1234" />)
      expect(await press(1, '{Delete}')).toEqual({ code: '134_', at: 1 })
      expect(await press(2, '{Control>}{Backspace}{/Control}')).toEqual({ code: '____', at: 0 })
    })

    it('Control with an arrow goes to the first cell, or to the end of the code', async () => {
      render(<Page direction={direction} defaultValue="12" />)
      expect(await press(1, '{Control>}{ArrowLeft}{/Control}')).toEqual({ code: '12__', at: 0 })
      expect(await press(0, '{Control>}{ArrowRight}{/Control}')).toEqual({ code: '12__', at: 2 })
    })

    it('the focus cannot pass the first empty cell', async () => {
      render(<Page direction={direction} defaultValue="1" />)
      cells()[3]?.focus()
      expect(where()).toBe(1)
      await userEvent.click(cells()[3] as HTMLInputElement)
      expect(where()).toBe(1)
    })
  })
}

describe('a page with no provider', () => {
  it('in a dir="rtl" box the arrows still run left to right', async () => {
    render(<div dir="rtl"><OTPField aria-labelledby="none" length={3} defaultValue="123" /></div>)
    expect(await press(1, '{ArrowLeft}')).toEqual({ code: '123', at: 0 })
    expect(screen.getByRole('group').getAttribute('dir')).toBe('ltr')
  })
})
