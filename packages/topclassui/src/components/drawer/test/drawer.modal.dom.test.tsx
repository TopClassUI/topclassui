import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '../index.js'
import type { DrawerPopupProps, DrawerRootProps } from '../types.js'

/** A sheet and the page it sits on, so what the page keeps can be read. */
function Panel({ popup, ...root }: DrawerRootProps & { popup?: Partial<DrawerPopupProps> }) {
  return (
    <DrawerRoot {...root}>
      <DrawerTrigger render={<Button>Open</Button>} />
      <DrawerPopup {...popup}>
        <DrawerHeader><DrawerTitle>Panel</DrawerTitle></DrawerHeader>
        <DrawerBody>Body</DrawerBody>
        <DrawerFooter><DrawerClose render={<Button>Done</Button>} /></DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}

const classes = (element: Element | null | undefined) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

/** The popup once open, with what its portal holds beside it and what the lock did to the page. */
async function opened(root: DrawerRootProps = {}) {
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

// What a press and a wheel really reach is measured in e2e/drawer.spec.ts; here, what the markup says.
describe('each value of modal', () => {
  it('true, the default: a scrim, a viewport that takes presses, the page hidden and locked', async () => {
    expect(await opened()).toMatchObject({ scrims: 1, passive: [false, false], pageHidden: 'true', pageLocked: 'hidden' })
  })

  it('true, written out, is the same sheet', async () => {
    expect(await opened({ modal: true })).toMatchObject({ scrims: 1, passive: [false, false], pageHidden: 'true', pageLocked: 'hidden' })
  })

  it('trap-focus: no scrim, a viewport that lets presses through, the page hidden but not locked', async () => {
    expect(await opened({ modal: 'trap-focus' })).toMatchObject({ scrims: 0, passive: [true, true], pageHidden: 'true', pageLocked: '' })
  })

  it('false: no scrim, a viewport that lets presses through, the page neither hidden nor locked', async () => {
    expect(await opened({ modal: false })).toMatchObject({ scrims: 0, passive: [true, true], pageHidden: null, pageLocked: '' })
  })

  it('a sheet that is not modal keeps its viewport, which still seats it at its edge and carries the direction and the language', async () => {
    render(<TopClassProvider direction="rtl" locale="ar"><Panel defaultOpen modal={false} /></TopClassProvider>)
    const viewport = (await screen.findByRole('dialog')).parentElement
    expect(classes(viewport)).toEqual(['fixed', 'inset-0', 'z-(--tc-z-drawer)', 'flex', 'justify-end', 'pointer-events-none'])
    expect([viewport?.getAttribute('dir'), viewport?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
  })

  it('follows the nearest root: a panel that is not modal, opened from inside a modal sheet, draws no scrim of its own', async () => {
    render(
      <DrawerRoot defaultOpen>
        <DrawerPopup aria-label="Outer">
          <DrawerBody><Panel defaultOpen modal={false} /></DrawerBody>
        </DrawerPopup>
      </DrawerRoot>,
    )
    const inner = await screen.findByRole('dialog', { name: 'Panel' })
    const outer = screen.getByRole('dialog', { name: 'Outer', hidden: true })
    expect(classes(inner)).toContain('pointer-events-auto')
    expect(classes(outer)).not.toContain('pointer-events-auto')
    expect(document.querySelectorAll('.bg-overlay')).toHaveLength(1)
  })
})

describe('the two props of the portal reach it from DrawerPopup', () => {
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

  it('keepMounted: a closed sheet stays in the document, hidden, and opens and closes without leaving it', async () => {
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

  it('without it a closed sheet is not in the document at all', () => {
    render(<Panel />)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('never forwards either prop onto the popup element', async () => {
    render(<Panel defaultOpen popup={{ keepMounted: true, container: document.body }} />)
    const popup = await screen.findByRole('dialog')
    expect(popup.outerHTML.slice(0, popup.outerHTML.indexOf('>'))).not.toMatch(/keepmounted|container/i)
  })
})
