import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { PopoverClose, PopoverPopup, PopoverRoot, PopoverTitle } from '../index.js'

/** An open popover that holds one close. */
async function close(element: ReactElement) {
  render(
    <PopoverRoot defaultOpen>
      <PopoverPopup><PopoverTitle>Share this page</PopoverTitle>{element}</PopoverPopup>
    </PopoverRoot>,
  )
  return (await screen.findByRole('dialog')).querySelector('button') as HTMLButtonElement
}

const classes = (element: Element) => (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
const closed = () => waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })

describe('a PopoverClose with nothing in it is the x', () => {
  it('is a button named by labels.common.close, holding one hidden icon and no text', async () => {
    const x = await close(<PopoverClose />)
    expect(x.tagName).toBe('BUTTON')
    expect(x.getAttribute('type')).toBe('button')
    expect(x.getAttribute('aria-label')).toBe('Close')
    expect(x.textContent).toBe('')
    expect(x.querySelectorAll('svg')).toHaveLength(1)
    expect(x.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(x.querySelector('path')?.getAttribute('d')?.slice(0, 10)).toBe('M205.66,19')
  })

  it('wears the icon button: the 24 px floor, 44 under a finger, the ring and the ghost hover on the neutral ramp', async () => {
    const list = classes(await close(<PopoverClose />))
    for (const cls of [
      'inline-flex', 'shrink-0', 'rounded-control', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      'focus-visible:outline-solid', 'text-muted', 'tone-neutral', 'hover:bg-(--tc-soft)',
    ]) expect(list, cls).toContain(cls)
  })

  it('closes the popover', async () => {
    await userEvent.click(await close(<PopoverClose />))
    await closed()
  })

  it('takes a name of the caller in place of the label', async () => {
    const x = await close(<PopoverClose aria-label="Dismiss the tip" />)
    expect(x.getAttribute('aria-label')).toBe('Dismiss the tip')
    expect(x.querySelectorAll('svg')).toHaveLength(1)
  })

  it('takes a className last, an id and a ref', async () => {
    const ref = { current: null as HTMLButtonElement | null }
    const x = await close(<PopoverClose ref={ref} id="x" className="text-body" />)
    expect(ref.current).toBe(x)
    expect(x.id).toBe('x')
    expect(classes(x)).toContain('text-body')
    expect(classes(x)).not.toContain('text-muted')
  })

  // React draws nothing for these, so a close that holds only them would be an invisible button with no name.
  for (const [label, children] of [['false', false], ['null', null], ['an empty string', ''], ['an array of nothing', [false, '']]] as const) {
    it(`is still the x when its children are ${label}`, async () => {
      const x = await close(<PopoverClose>{children}</PopoverClose>)
      expect(x.getAttribute('aria-label')).toBe('Close')
      expect(x.querySelectorAll('svg')).toHaveLength(1)
    })
  }
})

describe('the x is named in the language of the provider', () => {
  it('reads the Arabic label inside an Arabic provider', async () => {
    render(
      <TopClassProvider direction="rtl" locale="ar">
        <PopoverRoot defaultOpen><PopoverPopup><PopoverClose /></PopoverPopup></PopoverRoot>
      </TopClassProvider>,
    )
    const popup = await screen.findByRole('dialog')
    expect(popup.querySelector('button')?.getAttribute('aria-label')).toBe('إغلاق')
    expect(popup.outerHTML).not.toContain('Close')
  })

  it('follows an app that changes that one string', async () => {
    render(
      <TopClassProvider direction="ltr" locale="en" labels={{ common: { close: 'Close the panel' } }}>
        <PopoverRoot defaultOpen><PopoverPopup><PopoverClose /></PopoverPopup></PopoverRoot>
      </TopClassProvider>,
    )
    const popup = await screen.findByRole('dialog')
    expect(popup.querySelector('button')?.getAttribute('aria-label')).toBe('Close the panel')
  })

  it('is common.close and not the label of a dialog: a popover is not announced as one to close', async () => {
    const x = await close(<PopoverClose />)
    expect(x.getAttribute('aria-label')).not.toBe('Close this dialog')
  })
})

describe('a PopoverClose with content is that control, not the x', () => {
  it('with children it is a plain button with that text, no icon, no label and no class', async () => {
    const button = await close(<PopoverClose>Cancel</PopoverClose>)
    expect(button.textContent).toBe('Cancel')
    expect(button.getAttribute('class')).toBeNull()
    expect(button.getAttribute('aria-label')).toBeNull()
    expect(button.querySelector('svg')).toBeNull()
  })

  it('with render it is the Button it was given, with that Button label and classes', async () => {
    const button = await close(<PopoverClose render={<Button variant="outline">Cancel</Button>} />)
    expect(button.innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Cancel</span>')
    expect(button.getAttribute('data-variant')).toBe('outline')
    expect(button.getAttribute('aria-label')).toBeNull()
    expect(classes(button)).not.toContain('tone-neutral')
  })

  it('a className on it replaces a conflicting class of that Button', async () => {
    const button = await close(<PopoverClose className="h-control-sm" render={<Button>Cancel</Button>} />)
    expect(classes(button)).toContain('h-control-sm')
    expect(classes(button)).not.toContain('h-control-md')
  })

  it('still closes the popover', async () => {
    await userEvent.click(await close(<PopoverClose render={<Button>Done</Button>} />))
    await closed()
  })

  it('a number is content too: 0 is drawn, so it is not the x', async () => {
    const button = await close(<PopoverClose>{0}</PopoverClose>)
    expect(button.textContent).toBe('0')
    expect(button.querySelector('svg')).toBeNull()
  })
})
