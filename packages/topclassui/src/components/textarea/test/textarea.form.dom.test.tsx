import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Textarea } from '../index.js'

/** What `new FormData(form)` holds, as pairs. */
const sent = (form: HTMLFormElement | null) => [...new FormData(form ?? undefined).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])

describe('what the form receives: the text, natively', () => {
  it('from the server HTML alone, with no script: the default, and what is typed into it', () => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(<form><Textarea aria-label="Bio" name="bio" defaultValue="Hello" /><Textarea aria-label="Note" name="note" showCount /></form>)
    const form = host.querySelector('form')
    expect(sent(form)).toEqual([['bio', 'Hello'], ['note', '']])
    const note = host.querySelector('textarea[name="note"]') as HTMLTextAreaElement
    note.value = 'Typed before any script'
    expect(sent(form)).toEqual([['bio', 'Hello'], ['note', 'Typed before any script']])
  })

  it('after typing, and after a reset, which needs no hook: the default is back', async () => {
    render(<form><Textarea aria-label="Bio" name="bio" defaultValue="Hello" autosize showCount /></form>)
    const field = screen.getByRole('textbox')
    await userEvent.type(field, ', world')
    const form = field.closest('form')
    expect(sent(form)).toEqual([['bio', 'Hello, world']])
    form?.reset()
    expect(sent(form)).toEqual([['bio', 'Hello']])
  })

  // happy-dom sends a disabled textarea too: that it is left out is measured in e2e/textarea.spec.ts.
  it('a field outside its form, tied to it by the form attribute, is sent, and a read-only one is', () => {
    render(
      <>
        <form id="outside" />
        <Textarea aria-label="Far" name="far" form="outside" defaultValue="far" showCount />
        <form>
          <Textarea aria-label="Kept" name="kept" readOnly defaultValue="kept" />
        </form>
      </>,
    )
    expect(sent(document.getElementById('outside') as HTMLFormElement)).toEqual([['far', 'far']])
    expect(sent(screen.getByRole('textbox', { name: 'Kept' }).closest('form'))).toEqual([['kept', 'kept']])
  })

  it('the cap is the native maxlength, so the browser stops the typing there', async () => {
    render(<form><Textarea aria-label="Code" name="code" maxLength={4} /></form>)
    await userEvent.type(screen.getByRole('textbox'), 'abcdefgh')
    expect(sent(screen.getByRole('textbox').closest('form'))).toEqual([['code', 'abcd']])
  })
})
