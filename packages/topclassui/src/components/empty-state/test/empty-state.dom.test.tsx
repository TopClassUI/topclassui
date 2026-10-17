import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

describe('in a real tree', () => {
  it('is read as its text, with no role of its own and no heading level forced on the page', () => {
    render(<EmptyState />)
    const root = screen.getByText('Nothing here yet').closest('div')
    expect(root?.getAttribute('role')).toBeNull()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('keeps the default icon out of the accessibility tree', () => {
    render(<EmptyState />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('is not a tab stop itself, so the first Tab lands on the action', async () => {
    render(<EmptyState title="No projects yet"><Button>New project</Button></EmptyState>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'New project' }))
  })

  it('is skipped entirely by Tab when it holds no action', async () => {
    render(<><EmptyState /><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })

  it('lets the action work, because the frame swallows no event', async () => {
    let clicks = 0
    render(<EmptyState><button type="button" onClick={() => { clicks += 1 }}>Retry</button></EmptyState>)
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(clicks).toBe(1)
  })
})

describe('ref', () => {
  it('is a normal prop and receives the root div', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<EmptyState ref={ref} />)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.className).toContain('border-dashed')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(<EmptyState ref={ref} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})
