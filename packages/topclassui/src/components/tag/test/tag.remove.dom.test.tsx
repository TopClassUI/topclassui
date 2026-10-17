import { render, screen } from '@testing-library/react'
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
