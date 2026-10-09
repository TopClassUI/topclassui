import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { CardBody, CardFooter, CardHeader, CardRoot, CardSkeleton } from '../index.js'
import type { CardRootProps } from '../types.js'

const PARTS: [string, ComponentType<CardRootProps>][] = [
  ['CardRoot', CardRoot],
  ['CardHeader', CardHeader],
  ['CardBody', CardBody],
  ['CardFooter', CardFooter],
]

describe('in a real tree', () => {
  it('is read as what it holds: the caller heading, then the text', () => {
    render(
      <CardRoot>
        <CardHeader><h2>Monthly report</h2></CardHeader>
        <CardBody>Revenue rose 12% against April.</CardBody>
      </CardRoot>,
    )
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Monthly report')
    expect(screen.getByText('Revenue rose 12% against April.').tagName).toBe('DIV')
  })

  it('is not a tab stop, so Tab goes straight to the action in its footer', async () => {
    render(
      <CardRoot>
        <CardHeader><h2>Monthly report</h2></CardHeader>
        <CardFooter><Button size="sm">Download PDF</Button></CardFooter>
      </CardRoot>,
    )
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Download PDF' }))
  })

  it('keeps the skeleton out of the accessibility tree', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('ref', () => {
  for (const [name, Part] of PARTS) {
    it(`${name} receives its div and is cleared on unmount`, () => {
      const ref = { current: null as HTMLDivElement | null }
      const { unmount } = render(<Part ref={ref}>Inside</Part>)
      expect(ref.current?.tagName, name).toBe('DIV')
      expect(ref.current?.textContent, name).toBe('Inside')
      unmount()
      expect(ref.current, name).toBeNull()
    })
  }

  it('reaches the skeleton div too, because a skeleton is a component', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardSkeleton ref={ref} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true')
  })
})
