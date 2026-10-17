import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../index.js'

describe('activation', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates on Enter and on Space, which is the native button contract', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    button.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('takes focus, so the keyboard can reach it', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    button.focus()
    expect(document.activeElement).toBe(button)
  })
})

describe('when it cannot be used', () => {
  it('does not fire while disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not fire while loading, because loading disables it', async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is announced as busy while loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('aria-busy')).toBe('true')
  })

  it('is not reachable by keyboard while disabled', async () => {
    render(<><Button disabled>First</Button><Button>Second</Button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Second' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the element', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Save' }))
  })

  it('receives the rendered element when the render prop changes it', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref} render={<a href="/docs" />}>Docs</Button>)
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Docs' }))
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLButtonElement | null }
    const { unmount } = render(<Button ref={ref}>Save</Button>)
    unmount()
    expect(ref.current).toBeNull()
  })
})

describe('the render prop in a real tree', () => {
  it('becomes a link that is reachable as a link, not a button', () => {
    render(<Button render={<a href="/docs" />}>Docs</Button>)
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keeps the handler the caller put on the element', async () => {
    const onClick = vi.fn()
    render(<Button render={<a href="#x" onClick={onClick} />}>Go</Button>)
    await userEvent.click(screen.getByRole('link', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('runs both handlers when the component and the element each have one', async () => {
    const fromElement = vi.fn()
    const fromComponent = vi.fn()
    render(<Button render={<a href="#x" onClick={fromElement} />} onClick={fromComponent}>Go</Button>)
    await userEvent.click(screen.getByRole('link', { name: 'Go' }))
    expect(fromElement).toHaveBeenCalledTimes(1)
    expect(fromComponent).toHaveBeenCalledTimes(1)
  })
})
