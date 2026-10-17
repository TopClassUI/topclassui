import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { AvatarFallback, AvatarImage, AvatarRoot } from '#components/avatar/index.js'
import { ar } from '#shared/labels/ar.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'],
] as const

/** Initials alone are silent, so each avatar is named on its root, as a caller would. */
const team = (count: number) => TEAM.slice(0, count).map(([initials, name]) => (
  <AvatarRoot key={initials} role="img" aria-label={name}>
    <AvatarFallback>{initials}</AvatarFallback>
  </AvatarRoot>
))

/** What a screen reader meets inside the group, in order: the name of every image. */
const announced = (group: HTMLElement) =>
  within(group).getAllByRole('img').map((image) => image.getAttribute('aria-label') ?? image.getAttribute('alt'))

describe('what the group announces', () => {
  it('is found by its role and the name the caller gives it', () => {
    render(<AvatarGroup aria-label="Reviewers">{team(2)}</AvatarGroup>)
    expect(screen.getByRole('group', { name: 'Reviewers' }).tagName).toBe('SPAN')
  })

  it('takes its name from visible text through aria-labelledby too', () => {
    render(<><span id="who">Assignees</span><AvatarGroup aria-labelledby="who">{team(2)}</AvatarGroup></>)
    expect(screen.getByRole('group', { name: 'Assignees' }).children).toHaveLength(2)
  })

  it('reads each member that shows by name and then the counter, with nothing between', () => {
    render(<AvatarGroup max={2} aria-label="Team">{team(6)}</AvatarGroup>)
    expect(announced(screen.getByRole('group', { name: 'Team' }))).toEqual(['Omar Abed', 'Lina Haddad', '4 more'])
  })

  it('reads only the members when all of them fit', () => {
    render(<AvatarGroup aria-label="Team">{team(3)}</AvatarGroup>)
    expect(announced(screen.getByRole('group', { name: 'Team' }))).toEqual(['Omar Abed', 'Lina Haddad', 'Sara Khalil'])
  })

  it('exposes the counter as an image named "4 more", the last thing in the group', () => {
    render(<AvatarGroup max={2} aria-label="Team">{team(6)}</AvatarGroup>)
    const counter = within(screen.getByRole('group')).getByRole('img', { name: '4 more' })
    expect(counter).toBe(screen.getByRole('group').lastElementChild)
    expect(counter.textContent).toBe('+4')
  })

  it('keeps the +4 itself out of the accessibility tree, so the count is read once', () => {
    render(<AvatarGroup max={2} aria-label="Team">{team(6)}</AvatarGroup>)
    const text = screen.getByRole('img', { name: '4 more' }).firstElementChild
    expect(text?.textContent).toBe('+4')
    expect(text?.getAttribute('aria-hidden')).toBe('true')
  })

  it('names the counter in Arabic from the labels prop', () => {
    render(<AvatarGroup max={2} labels={ar} locale="ar" aria-label="الفريق">{team(6)}</AvatarGroup>)
    expect(announced(screen.getByRole('group', { name: 'الفريق' }))).toEqual(['Omar Abed', 'Lina Haddad', '4 آخرون'])
  })

  it('reads a picture by its alt beside initials named on the root', () => {
    render(
      <AvatarGroup aria-label="Team">
        <AvatarRoot>
          <AvatarImage src="/team/omar.jpg" alt="Omar Abed" />
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
        {team(2).slice(1)}
      </AvatarGroup>,
    )
    expect(announced(screen.getByRole('group'))).toEqual(['Omar Abed', 'Lina Haddad'])
  })
})

describe('in a real tree', () => {
  it('holds the avatars that show and one counter, in that order', () => {
    render(<AvatarGroup max={2} aria-label="Team">{team(6)}</AvatarGroup>)
    const group = screen.getByRole('group', { name: 'Team' })
    expect(group.children).toHaveLength(3)
    expect(group.children[0]?.textContent).toBe('OA')
    expect(group.children[1]?.textContent).toBe('LH')
    expect(group.children[2]?.textContent).toBe('+4')
  })

  it('leaves a hidden member out of the tree, so its picture is never fetched', () => {
    render(
      <AvatarGroup max={1} aria-label="Team">
        <AvatarRoot>
          <AvatarImage src="/team/omar.jpg" alt="Omar Abed" />
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
        <AvatarRoot>
          <AvatarImage src="/team/lina.jpg" alt="Lina Haddad" />
          <AvatarFallback>LH</AvatarFallback>
        </AvatarRoot>
      </AvatarGroup>,
    )
    expect(screen.getByAltText('Omar Abed').tagName).toBe('IMG')
    expect(screen.queryByAltText('Lina Haddad')).toBeNull()
    expect(screen.getByRole('img', { name: '1 more' }).tagName).toBe('SPAN')
  })

  it('follows a new max on re-render, because the props are the only state it has', () => {
    const { rerender } = render(<AvatarGroup max={2} aria-label="Team">{team(6)}</AvatarGroup>)
    rerender(<AvatarGroup max={5} aria-label="Team">{team(6)}</AvatarGroup>)
    expect(screen.getByRole('group').children).toHaveLength(6)
    expect(screen.getByRole('img', { name: '1 more' }).textContent).toBe('+1')
    rerender(<AvatarGroup max={6} aria-label="Team">{team(6)}</AvatarGroup>)
    expect(screen.queryByRole('img', { name: /more/ })).toBeNull()
    expect(screen.getByRole('group').children).toHaveLength(6)
  })

  it('drops the counter when members leave and the rest fit', () => {
    const { rerender } = render(<AvatarGroup max={2} aria-label="Team">{team(3)}</AvatarGroup>)
    expect(screen.getByRole('img', { name: '1 more' }).textContent).toBe('+1')
    rerender(<AvatarGroup max={2} aria-label="Team">{team(2)}</AvatarGroup>)
    expect(announced(screen.getByRole('group'))).toEqual(['Omar Abed', 'Lina Haddad'])
  })

  it('is not a tab stop, and neither is its counter: nothing about it can be activated', async () => {
    render(<><AvatarGroup max={2} aria-label="Team">{team(6)}</AvatarGroup><button type="button">Next</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }))
  })
})

describe('ref', () => {
  it('is a normal prop and receives the root span, which is the group', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<AvatarGroup ref={ref} aria-label="Team">{team(2)}</AvatarGroup>)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.getAttribute('role')).toBe('group')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { unmount } = render(<AvatarGroup ref={ref} aria-label="Team">{team(2)}</AvatarGroup>)
    unmount()
    expect(ref.current).toBeNull()
  })
})
