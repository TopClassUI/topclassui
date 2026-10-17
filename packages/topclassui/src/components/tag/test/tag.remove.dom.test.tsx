import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Tag } from '../index.js'

/** The x of the only removable tag on the page. */
const x = () => screen.getByRole('button')

describe('the x of a removable tag', () => {
  it('is named by the word for remove and then the label of its own tag', () => {
    render(<Tag onRemove={() => undefined}>design-system</Tag>)
    expect(x().getAttribute('aria-label')).toBe('Remove')
    const [own, label] = (x().getAttribute('aria-labelledby') ?? '').split(' ')
    expect(own).toBe(x().id)
    expect(document.getElementById(label ?? '')?.textContent).toBe('design-system')
  })

  it('gives each tag its own two ids, so two x never name each other', () => {
    render(<><Tag onRemove={() => undefined}>One</Tag><Tag onRemove={() => undefined}>Two</Tag></>)
    const ids = screen.getAllByRole('button').flatMap((button) => (button.getAttribute('aria-labelledby') ?? '').split(' '))
    expect(new Set(ids).size).toBe(4)
  })

  it('is a button that submits nothing, so a tag inside a form never sends it', () => {
    const submit = vi.fn((event: SubmitEvent) => { event.preventDefault() })
    render(<form onSubmit={(event) => { submit(event.nativeEvent) }}><Tag onRemove={() => undefined}>React</Tag></form>)
    expect(x().getAttribute('type')).toBe('button')
    x().click()
    expect(submit).not.toHaveBeenCalled()
  })

  it('calls onRemove once a press, and with nothing', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>React</Tag>)
    await userEvent.click(x())
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith()
  })

  it('is reached by Tab, and Enter and Space each call onRemove once', async () => {
    const onRemove = vi.fn()
    render(<><button type="button">Before</button><Tag onRemove={onRemove}>React</Tag></>)
    screen.getByRole('button', { name: 'Before' }).focus()
    await userEvent.tab()
    // The name the accessibility tree computes: aria-labelledby, its own aria-label first, then the label.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove React' }))
    await userEvent.keyboard('{Enter}')
    expect(onRemove).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(' ')
    expect(onRemove).toHaveBeenCalledTimes(2)
  })

  it('leaves the tag where it is: taking it out of the list is the caller', async () => {
    render(<Tag onRemove={() => undefined}>React</Tag>)
    await userEvent.click(x())
    expect(screen.getByText('React')).toBeTruthy()
  })

  it('speaks Arabic inside a right-to-left provider', () => {
    render(<TopClassProvider direction="rtl" locale="ar"><Tag onRemove={() => undefined}>تصميم</Tag></TopClassProvider>)
    expect(x().getAttribute('aria-label')).toBe('إزالة')
  })

  it('takes a reworded label from the provider', () => {
    render(<TopClassProvider direction="ltr" locale="en" labels={{ tag: { remove: 'Delete' } }}><Tag onRemove={() => undefined}>React</Tag></TopClassProvider>)
    expect(x().getAttribute('aria-label')).toBe('Delete')
  })

  it('still hands the ref and the rest to the root span', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Tag ref={ref} title="Topic" onRemove={() => undefined}>React</Tag>)
    expect(ref.current?.getAttribute('data-tone')).toBe('neutral')
    expect(ref.current?.getAttribute('title')).toBe('Topic')
    expect(ref.current?.lastElementChild?.tagName).toBe('BUTTON')
  })
})

/** A list of tags the caller takes out on remove, with a control after it; `move` lets the caller move the focus too. */
function Topics({ initial, move }: { initial: string[], move?: () => void }) {
  const [topics, setTopics] = useState(initial)
  return (
    <>
      <button type="button">Before</button>
      <ul aria-label="Topics">
        {topics.map((topic) => (
          <li key={topic}><Tag onRemove={() => { move?.(); setTopics(topics.filter((other) => other !== topic)) }}>{topic}</Tag></li>
        ))}
      </ul>
      <button type="button">After</button>
    </>
  )
}

const removeOf = (topic: string) => screen.getByRole('button', { name: `Remove ${topic}` })

// APG "Persistence of focus": the x leaves with its tag, so the focus it held goes to a neighbour, never the body.
describe('the focus after a removal', () => {
  it('goes to the next x of the same list', async () => {
    render(<Topics initial={['Alpha', 'Beta', 'Gamma']} />)
    removeOf('Beta').focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByRole('button', { name: 'Remove Beta' })).toBeNull()
    expect(document.activeElement).toBe(removeOf('Gamma'))
  })

  it('goes to the x before when the last one leaves, and on to the next tab stop when the list empties', async () => {
    render(<Topics initial={['Alpha', 'Beta']} />)
    removeOf('Beta').focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(removeOf('Alpha'))
    await userEvent.keyboard(' ')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }))
  })

  it('stays in its own list: the last x of one list goes back, not on to the first x of the next list', async () => {
    render(<><Topics initial={['Alpha', 'Beta']} /><Topics initial={['Gamma']} /></>)
    removeOf('Beta').focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(removeOf('Alpha'))
  })

  it('leaves the focus where the caller moved it', async () => {
    render(<Topics initial={['Alpha', 'Beta', 'Gamma']} move={() => { screen.getByRole('button', { name: 'Before' }).focus() }} />)
    removeOf('Beta').focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }))
  })

  it('moves nothing when the x did not hold the focus', () => {
    render(<Topics initial={['Alpha', 'Beta', 'Gamma']} />)
    screen.getByRole('button', { name: 'Before' }).focus()
    fireEvent.click(removeOf('Beta'))
    expect(screen.queryByRole('button', { name: 'Remove Beta' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }))
  })

  it('marks every x with data-tag-remove, the attribute the next x is found by', () => {
    render(<Topics initial={['Alpha', 'Beta']} />)
    expect(screen.getAllByRole('button').map((button) => button.hasAttribute('data-tag-remove'))).toEqual([false, true, true, false])
  })
})
