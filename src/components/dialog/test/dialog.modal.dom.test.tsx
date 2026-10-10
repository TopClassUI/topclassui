import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from '../index.js'
import type { DialogPopupProps, DialogRootProps } from '../types.js'

/** A dialog and the page it sits on, so what the page keeps can be read. */
function Panel({ popup, ...root }: DialogRootProps & { popup?: Partial<DialogPopupProps> }) {
  return (
    <DialogRoot {...root}>
      <DialogTrigger render={<Button>Open</Button>} />
      <DialogPopup {...popup}>
        <DialogHeader><DialogTitle>Panel</DialogTitle></DialogHeader>
        <DialogBody>Body</DialogBody>
        <DialogFooter><DialogClose render={<Button>Done</Button>} /></DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}

const classes = (element: Element | null | undefined) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

/** The popup once open, with what its portal holds beside it and what the lock did to the page. */
async function opened(root: DialogRootProps = {}) {
  const { container } = render(<Panel defaultOpen {...root} />)
  const popup = await screen.findByRole('dialog')
  // Longer than the timer Base UI locks the page from, so a lock that is coming has come.
  await new Promise((resolve) => { setTimeout(resolve, 30) })
  const viewport = popup.parentElement
  return {
    popup, viewport,
    scrims: [...(viewport?.parentElement?.children ?? [])].filter((child) => classes(child).includes('bg-overlay')).length,
    passive: [classes(viewport).includes('pointer-events-none'), classes(popup).includes('pointer-events-auto')],
    pageHidden: container.getAttribute('aria-hidden'),
    pageLocked: document.body.style.overflowY,
  }
}

// What a press and a wheel really reach is measured in e2e/dialog.spec.ts; here, what the markup says.
describe('each value of modal', () => {
  it('true, the default: a scrim, a viewport that takes presses, the page hidden and locked', async () => {
    expect(await opened()).toMatchObject({ scrims: 1, passive: [false, false], pageHidden: 'true', pageLocked: 'hidden' })
  })

  it('true, written out, is the same dialog', async () => {
    expect(await opened({ modal: true })).toMatchObject({ scrims: 1, passive: [false, false], pageHidden: 'true', pageLocked: 'hidden' })
  })

  it('trap-focus: no scrim, a viewport that lets presses through, the page hidden but not locked', async () => {
    expect(await opened({ modal: 'trap-focus' })).toMatchObject({ scrims: 0, passive: [true, true], pageHidden: 'true', pageLocked: '' })
  })

  it('false: no scrim, a viewport that lets presses through, the page neither hidden nor locked', async () => {
    expect(await opened({ modal: false })).toMatchObject({ scrims: 0, passive: [true, true], pageHidden: null, pageLocked: '' })
  })

  it('a dialog that is not modal keeps its viewport, which still centres it and carries the direction', async () => {
    const { viewport } = await opened({ modal: false })
    expect(classes(viewport)).toEqual([
      'fixed', 'inset-0', 'z-(--tc-z-dialog)', 'grid', 'place-items-center', 'p-(--tc-overlay-inset)', 'pointer-events-none',
    ])
    expect(viewport?.getAttribute('dir')).toBe('ltr')
  })

  it('follows the nearest root: a panel that is not modal, opened from inside a modal dialog, draws no scrim of its own', async () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPopup aria-label="Outer">
          <DialogBody><Panel defaultOpen modal={false} /></DialogBody>
        </DialogPopup>
      </DialogRoot>,
    )
    const inner = await screen.findByRole('dialog', { name: 'Panel' })
    const outer = screen.getByRole('dialog', { name: 'Outer', hidden: true })
    expect(classes(inner)).toContain('pointer-events-auto')
    expect(classes(outer)).not.toContain('pointer-events-auto')
    expect(document.querySelectorAll('.bg-overlay')).toHaveLength(1)
  })
})

describe('the two props of the portal reach it from DialogPopup', () => {
  it('container: the popup mounts inside the element it is given, not at the end of the body', async () => {
    const host = document.createElement('section')
    document.body.append(host)
    render(<Panel defaultOpen popup={{ container: host }} />)
    const popup = await screen.findByRole('dialog')
    expect(host.contains(popup)).toBe(true)
    expect(popup.closest('[data-base-ui-portal]')?.parentElement).toBe(host)
    host.remove()
  })

  it('without one it mounts in the body', async () => {
    render(<Panel defaultOpen />)
    expect((await screen.findByRole('dialog')).closest('[data-base-ui-portal]')?.parentElement).toBe(document.body)
  })

  it('keepMounted: a closed dialog stays in the document, hidden, and opens and closes without leaving it', async () => {
    render(<Panel popup={{ keepMounted: true }} />)
    const popup = await waitFor(() => {
      const found = document.querySelector('[role="dialog"]')
      if (!found) throw new Error('the popup is not mounted')
      return found
    })
    expect(popup.hasAttribute('hidden')).toBe(true)
    expect(popup.hasAttribute('data-open')).toBe(false)

    await userEvent.click(screen.getByText('Open', { selector: 'span' }).closest('button') as HTMLButtonElement)
    await waitFor(() => { expect(popup.hasAttribute('data-open')).toBe(true) })
    expect(popup.hasAttribute('hidden')).toBe(false)

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(popup.hasAttribute('hidden')).toBe(true) })
    expect(document.querySelector('[role="dialog"]')).toBe(popup)
  })

  it('without it a closed dialog is not in the document at all', () => {
    render(<Panel />)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('never forwards either prop onto the popup element', async () => {
    render(<Panel defaultOpen popup={{ keepMounted: true, container: document.body }} />)
    const popup = await screen.findByRole('dialog')
    expect(popup.outerHTML.slice(0, popup.outerHTML.indexOf('>'))).not.toMatch(/keepmounted|container/i)
  })
})
