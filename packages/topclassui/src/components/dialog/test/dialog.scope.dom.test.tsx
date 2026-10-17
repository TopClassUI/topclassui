import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle } from '../index.js'

/** Two dialogs open from the start, one inside the other, as a settings dialog holds a rename dialog. */
function Nested({ attribute }: { attribute?: string }) {
  return (
    <DialogRoot defaultOpen>
      <DialogPopup>
        <DialogHeader><DialogTitle>Outer</DialogTitle></DialogHeader>
        <DialogBody>
          <DialogRoot defaultOpen modal={false}>
            <DialogPopup {...{ 'data-overlay': attribute }}>
              <DialogHeader><DialogTitle>Inner</DialogTitle></DialogHeader>
            </DialogPopup>
          </DialogRoot>
        </DialogBody>
      </DialogPopup>
    </DialogRoot>
  )
}

const scopeOf = async (name: string) =>
  (await screen.findByRole('dialog', { name })).getAttribute('data-overlay') ?? ''

// The Escape guard of each root looks inside the popup that carries its scope, and no other dialog.
describe('each popup carries the scope of its own root', () => {
  it('writes one that is not empty, and not the scope of the dialog around it', async () => {
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
