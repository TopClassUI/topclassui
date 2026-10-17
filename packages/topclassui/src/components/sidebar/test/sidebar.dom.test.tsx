import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type MouseEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { house } from '#icons/data/house.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot, SidebarTrigger } from '../index.js'
import type { SidebarRootProps } from '../types.js'

function rail(props: Partial<SidebarRootProps> = {}) {
  return (
    <SidebarRoot {...props}>
      <SidebarHeader>Workspace</SidebarHeader>
      <SidebarBody data-testid="body">
        <SidebarGroup label="Pages">
          <SidebarLink href="/home" icon={<Svg icon={house} />} current>Home</SidebarLink>
          <SidebarLink href="/team" icon={<Svg icon={house} />}>Team</SidebarLink>
        </SidebarGroup>
      </SidebarBody>
    </SidebarRoot>
  )
}

const nav = () => screen.getByRole('navigation')
const toggle = () => screen.getByRole('button')

/** What the rail says about itself: its two presence attributes, and the state and the name of its toggle. */
const state = () => ({
  open: nav().getAttribute('data-open'), closed: nav().getAttribute('data-closed'),
  expanded: toggle().getAttribute('aria-expanded'), name: toggle().getAttribute('aria-label'),
})

const OPEN = { open: '', closed: null, expanded: 'true', name: 'Collapse the sidebar' }
const CLOSED = { open: null, closed: '', expanded: 'false', name: 'Expand the sidebar' }

describe('a rail that holds its own state', () => {
  it('starts expanded, and a press on the toggle collapses it and another expands it', async () => {
    const user = userEvent.setup()
    render(rail())
    expect(state()).toEqual(OPEN)
    await user.click(toggle())
    expect(state()).toEqual(CLOSED)
    await user.click(toggle())
    expect(state()).toEqual(OPEN)
  })

  it('starts collapsed with defaultOpen={false}, and a press expands it', async () => {
    const user = userEvent.setup()
    render(rail({ defaultOpen: false }))
    expect(state()).toEqual(CLOSED)
    await user.click(toggle())
    expect(state()).toEqual(OPEN)
  })

  it('calls onOpenChange once a press with the state the press asks for, and never on its own', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(rail({ onOpenChange }))
    expect(onOpenChange).not.toHaveBeenCalled()
    await user.click(toggle())
    expect(onOpenChange.mock.calls).toEqual([[false]])
    await user.click(toggle())
    expect(onOpenChange.mock.calls).toEqual([[false], [true]])
  })

  it('Enter and Space on the toggle do what a press does, and the focus stays on it', async () => {
    const user = userEvent.setup()
    render(rail())
    toggle().focus()
    await user.keyboard('{Enter}')
    expect(state()).toEqual(CLOSED)
    await user.keyboard(' ')
    expect(state()).toEqual(OPEN)
    expect(document.activeElement).toBe(toggle())
  })

  it('two rails on one page each keep their own state', async () => {
    const user = userEvent.setup()
    render(<>{rail({ 'aria-label': 'First' })}{rail({ 'aria-label': 'Second' })}</>)
    const [first, second] = screen.getAllByRole('button')
    if (first) await user.click(first)
    expect(screen.getByRole('navigation', { name: 'First' }).hasAttribute('data-closed')).toBe(true)
    expect(screen.getByRole('navigation', { name: 'Second' }).hasAttribute('data-open')).toBe(true)
    expect(second?.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('a rail whose caller holds the state', () => {
  it('does not move when the caller never changes open: each press only asks, with the same answer', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(rail({ open: true, onOpenChange }))
    await user.click(toggle())
    await user.click(toggle())
    expect(onOpenChange.mock.calls).toEqual([[false], [false]])
    expect(state()).toEqual(OPEN)
  })

  it('follows the caller when open changes with no press at all, and asks nothing', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(rail({ open: true, onOpenChange }))
    rerender(rail({ open: false, onOpenChange }))
    expect(state()).toEqual(CLOSED)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('moves when the caller follows the request, as an uncontrolled one does', async () => {
    const user = userEvent.setup()
    function Held() {
      const [open, setOpen] = useState(false)
      return rail({ open, onOpenChange: setOpen })
    }
    render(<Held />)
    expect(state()).toEqual(CLOSED)
    await user.click(toggle())
    expect(state()).toEqual(OPEN)
  })
})

describe('the toggle', () => {
  it("runs its caller's onClick first, and one that prevents the default stops the toggle", async () => {
    const user = userEvent.setup()
    const order: string[] = []
    const onOpenChange = vi.fn(() => { order.push('change') })
    let stop = false
    const onClick = (event: MouseEvent) => { order.push('click'); if (stop) event.preventDefault() }
    render(
      <SidebarRoot onOpenChange={onOpenChange}>
        <SidebarTrigger onClick={onClick} />
      </SidebarRoot>,
    )
    await user.click(toggle())
    expect(order).toEqual(['click', 'change'])
    expect(state()).toEqual(CLOSED)
    stop = true
    await user.click(toggle())
    expect(order).toEqual(['click', 'change', 'click'])
    expect(state()).toEqual(CLOSED)
  })

  it('works from anywhere inside its rail, not only from the header', async () => {
    const user = userEvent.setup()
    render(<SidebarRoot><SidebarBody><SidebarTrigger /></SidebarBody></SidebarRoot>)
    await user.click(toggle())
    expect(state()).toEqual(CLOSED)
  })

  it('a disabled one takes no press', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<SidebarRoot onOpenChange={onOpenChange}><SidebarTrigger disabled /></SidebarRoot>)
    await user.click(toggle())
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(state()).toEqual(OPEN)
  })
})

describe('a collapsed rail keeps every name', () => {
  it('each link is still found by its name, and the list by its label: the text is hidden by CSS, never removed', async () => {
    const user = userEvent.setup()
    render(rail())
    const before = screen.getByTestId('body').innerHTML
    await user.click(toggle())
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home')
    expect(screen.getByRole('link', { name: 'Team' }).getAttribute('href')).toBe('/team')
    expect(screen.getByRole('list', { name: 'Pages' })).toBeDefined()
    expect(screen.getByText('Workspace')).toBeDefined()
    // The server parts render nothing different: the markup under the body is the same, byte for byte.
    expect(screen.getByTestId('body').innerHTML).toBe(before)
  })

  it('the current row keeps aria-current through a press', async () => {
    const user = userEvent.setup()
    render(rail())
    await user.click(toggle())
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Team' }).hasAttribute('aria-current')).toBe(false)
  })
})

describe('ref is a normal prop on every part (R-5.7-3)', () => {
  it('reaches the nav, the button, the two divs, the div of a group and the link of a row', () => {
    const refs = { root: vi.fn(), trigger: vi.fn(), header: vi.fn(), body: vi.fn(), group: vi.fn(), link: vi.fn() }
    render(
      <SidebarRoot ref={refs.root}>
        <SidebarHeader ref={refs.header}>Workspace</SidebarHeader>
        <SidebarTrigger ref={refs.trigger} aria-label="Second toggle" />
        <SidebarBody ref={refs.body}>
          <SidebarGroup ref={refs.group}><SidebarLink ref={refs.link} href="/home">Home</SidebarLink></SidebarGroup>
        </SidebarBody>
      </SidebarRoot>,
    )
    const tags = Object.fromEntries(Object.entries(refs).map(([name, ref]) => [name, (ref.mock.calls[0]?.[0] as Element | undefined)?.tagName]))
    expect(tags).toEqual({ root: 'NAV', trigger: 'BUTTON', header: 'DIV', body: 'DIV', group: 'DIV', link: 'A' })
  })
})
