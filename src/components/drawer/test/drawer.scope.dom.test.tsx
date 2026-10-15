import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '../index.js'

/** Two sheets open from the start, the inner one's trigger in the outer one, as a menu sheet holds a share sheet. */
function Nested({ attribute }: { attribute?: string }) {
  return (
    <DrawerRoot defaultOpen>
      <DrawerPopup>
        <DrawerHeader><DrawerTitle>Outer</DrawerTitle></DrawerHeader>
        <DrawerBody>
          <DrawerRoot defaultOpen modal={false}>
            <DrawerTrigger>Share</DrawerTrigger>
            <DrawerPopup {...{ 'data-overlay': attribute }}>
              <DrawerHeader><DrawerTitle>Inner</DrawerTitle></DrawerHeader>
            </DrawerPopup>
          </DrawerRoot>
        </DrawerBody>
      </DrawerPopup>
    </DrawerRoot>
  )
}

const scopeOf = async (name: string) =>
  (await screen.findByRole('dialog', { name })).getAttribute('data-overlay') ?? ''
const titles = () => [...document.querySelectorAll('[role="dialog"] h2')].map((title) => title.textContent)

// The Escape guard of each root looks inside the popup that carries its scope, and no other sheet or dialog.
describe('each sheet carries the scope of its own root', () => {
  it('writes one that is not empty, and not the scope of the sheet around it', async () => {
    render(<Nested />)
    const [outer, inner] = [await scopeOf('Outer'), await scopeOf('Inner')]
    expect(outer).not.toBe('')
    expect(inner).not.toBe('')
    expect(inner).not.toBe(outer)
  })

  it('keeps it over a data-overlay of the caller, which would point the guard at nothing', async () => {
    render(<Nested attribute="mine" />)
    expect(await scopeOf('Inner')).not.toBe('mine')
  })
})

// The inner trigger sits in the outer sheet and is itself open: a guard reading every dialog swallowed the key.
describe('a sheet nested in another, focus back on its trigger', () => {
  it('the first Escape closes the inner sheet and leaves the outer one open, the second closes the outer one', async () => {
    render(<Nested />)
    await scopeOf('Inner')
    screen.getByRole('button', { name: 'Share' }).focus()
    expect(document.activeElement?.textContent).toBe('Share')

    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(titles()).toEqual(['Outer']) })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(titles()).toEqual([]) })
  })
})
