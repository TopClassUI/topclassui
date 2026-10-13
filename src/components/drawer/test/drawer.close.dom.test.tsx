import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '../index.js'

const closed = () => waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })

/** A sheet open from the start whose footer holds one element. Its popup, and the button of that footer. */
async function withFooter(element: ReactElement) {
  render(
    <DrawerRoot defaultOpen>
      <DrawerPopup aria-label="Sheet"><DrawerBody>Body</DrawerBody><DrawerFooter>{element}</DrawerFooter></DrawerPopup>
    </DrawerRoot>,
  )
  const popup = await screen.findByRole('dialog')
  return { popup, inFooter: popup.children[1]?.querySelector('button') ?? null, x: popup.lastElementChild }
}

describe('the x of the sheet', () => {
  it('is a button named by the labels, holding one hidden icon and no text', async () => {
    const { x } = await withFooter(<span>Nothing to press</span>)
    expect(x?.tagName).toBe('BUTTON')
    expect(x?.getAttribute('type')).toBe('button')
    expect(x?.getAttribute('aria-label')).toBe('Close this panel')
    expect(x?.textContent).toBe('')
    expect(x?.querySelectorAll('svg')).toHaveLength(1)
    expect(x?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(x?.querySelector('path')?.getAttribute('d')?.slice(0, 10)).toBe('M205.66,19')
  })

  it('closes the sheet', async () => {
    const { x } = await withFooter(<span>Nothing to press</span>)
    await userEvent.click(x as Element)
    await closed()
  })

  it('stays the last element when the caller puts a close of their own in the footer', async () => {
    const { popup, inFooter, x } = await withFooter(<DrawerClose render={<Button>Done</Button>} />)
    expect(inFooter?.textContent).toBe('Done')
    expect(x?.getAttribute('aria-label')).toBe('Close this panel')
    expect([...popup.querySelectorAll('button')].map((button) => button.getAttribute('aria-label') ?? button.textContent))
      .toEqual(['Done', 'Close this panel'])
  })
})

describe('a bare DrawerClose is an x too, wherever the caller puts it', () => {
  it('holds the same icon and the same name, and closes the sheet', async () => {
    const { inFooter } = await withFooter(<DrawerClose />)
    expect(inFooter?.getAttribute('aria-label')).toBe('Close this panel')
    expect(inFooter?.querySelectorAll('svg')).toHaveLength(1)
    await userEvent.click(inFooter as Element)
    await closed()
  })

  it('sits in the flow of its parent: only the x of the sheet itself is absolute', async () => {
    const { inFooter, x } = await withFooter(<DrawerClose />)
    expect((inFooter?.getAttribute('class') ?? '').split(' ')).not.toContain('absolute')
    expect((x?.getAttribute('class') ?? '').split(' ')).toContain('absolute')
  })

  it('takes a name of the caller in place of the label', async () => {
    const { inFooter } = await withFooter(<DrawerClose aria-label="Discard the draft" />)
    expect(inFooter?.getAttribute('aria-label')).toBe('Discard the draft')
    expect(inFooter?.querySelectorAll('svg')).toHaveLength(1)
  })
})

describe('DrawerClose with content is that control, not the x', () => {
  it('with children it is a plain button with that text, no icon, no label and no class', async () => {
    const { inFooter } = await withFooter(<DrawerClose>Cancel</DrawerClose>)
    expect(inFooter?.textContent).toBe('Cancel')
    expect(inFooter?.getAttribute('class')).toBeNull()
    expect(inFooter?.getAttribute('aria-label')).toBeNull()
    expect(inFooter?.querySelector('svg')).toBeNull()
  })

  it('with render it is the Button it was given, with that Button label and classes', async () => {
    const { inFooter } = await withFooter(<DrawerClose render={<Button variant="outline">Cancel</Button>} />)
    expect(inFooter?.getAttribute('data-variant')).toBe('outline')
    expect(inFooter?.getAttribute('aria-label')).toBeNull()
    expect(inFooter?.querySelector('svg')).toBeNull()
    await userEvent.click(inFooter as Element)
    await closed()
  })

  // `{saving && 'Saving'}` is false most of the time: an empty, nameless, 0 px button would be the result.
  for (const [what, children] of [
    ['null', null], ['false', false], ['an empty string', ''], ['a list of nothing', [false, null, '']],
  ] as const) {
    it(`with children that are ${what} it is the x, never an empty button with no name`, async () => {
      const { inFooter } = await withFooter(<DrawerClose>{children}</DrawerClose>)
      expect(inFooter?.getAttribute('aria-label')).toBe('Close this panel')
      expect(inFooter?.querySelectorAll('svg')).toHaveLength(1)
      expect(inFooter?.getAttribute('class')).toContain('min-h-[var(--tc-target-min,24px)]')
    })
  }

  it('with zero as its child it is a button that reads 0, since React draws a zero', async () => {
    const { inFooter } = await withFooter(<DrawerClose>{0}</DrawerClose>)
    expect(inFooter?.textContent).toBe('0')
    expect(inFooter?.querySelector('svg')).toBeNull()
  })

  it('with render and children that draw nothing, the control keeps the label it brought', async () => {
    const { inFooter } = await withFooter(<DrawerClose render={<Button>Cancel</Button>}>{false}</DrawerClose>)
    expect(inFooter?.innerHTML).toBe('<span class="truncate min-w-0">Cancel</span>')
  })
})

// A trigger has no x to fall back on: with nothing to draw it is the control passed to render, as that control is.
describe('DrawerTrigger with children that draw nothing', () => {
  it('leaves the Button passed to render its own label: the props of a render element win', () => {
    render(
      <DrawerRoot>
        <DrawerTrigger render={<Button>Open</Button>}>{false}</DrawerTrigger>
        <DrawerPopup><DrawerHeader><DrawerTitle>Sheet</DrawerTitle></DrawerHeader></DrawerPopup>
      </DrawerRoot>,
    )
    expect(screen.getByRole('button', { name: 'Open' }).innerHTML).toBe('<span class="truncate min-w-0">Open</span>')
  })

  it('and a Button with no label of its own takes the one written on the trigger, in a client file', () => {
    render(
      <DrawerRoot>
        <DrawerTrigger render={<Button />}>Open</DrawerTrigger>
        <DrawerPopup><DrawerHeader><DrawerTitle>Sheet</DrawerTitle></DrawerHeader></DrawerPopup>
      </DrawerRoot>,
    )
    expect(screen.getByRole('button', { name: 'Open' }).innerHTML).toBe('<span class="truncate min-w-0">Open</span>')
  })
})
