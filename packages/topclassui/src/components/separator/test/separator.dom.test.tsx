import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Separator } from '../index.js'

describe('in a real tree', () => {
  it('keeps a decorative separator out of the accessibility tree', () => {
    render(<><p>Above</p><Separator /><Separator orientation="vertical" /><p>Below</p></>)
    expect(screen.queryAllByRole('separator')).toEqual([])
  })

  it('exposes a separator that is not decorative, with its orientation', () => {
    render(<><Separator decorative={false} /><Separator orientation="vertical" decorative={false} /></>)
    const found = screen.getAllByRole('separator')
    expect(found.map((el) => el.getAttribute('aria-orientation'))).toEqual(['horizontal', 'vertical'])
  })

  it('is not a tab stop, because nothing about it can be activated', async () => {
    render(<><Separator decorative={false} /><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the div', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Separator ref={ref} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(<Separator ref={ref} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
