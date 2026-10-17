import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { Spinner } from '../index.js'

describe('in a real tree', () => {
  it('is found as an image named Loading', () => {
    render(<Spinner />)
    expect(screen.getByRole('img', { name: 'Loading' }).tagName.toLowerCase()).toBe('svg')
  })

  it('is found by its Arabic name when given the Arabic labels', () => {
    render(<Spinner labels={ar} />)
    expect(screen.getByRole('img', { name: 'جارٍ التحميل' })).toBeTruthy()
  })

  it('is not a status, so nothing announces it while it spins', () => {
    render(<Spinner />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('leaves the accessibility tree when aria-hidden, beside text that names the wait', () => {
    const { container } = render(<p><Spinner aria-hidden />Building your preview</p>)
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('is not a tab stop, because nothing about it can be activated', async () => {
    render(<><Spinner /><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the svg itself', () => {
    const ref = { current: null as SVGSVGElement | null }
    render(<Spinner ref={ref} />)
    expect(ref.current?.tagName.toLowerCase()).toBe('svg')
    expect(ref.current?.getAttribute('data-tone')).toBe('primary')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as SVGSVGElement | null }
    const { unmount } = render(<Spinner ref={ref} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
