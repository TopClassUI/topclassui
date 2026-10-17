import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { type FormErrors, FormErrorsContext, useFormErrors } from './form-errors.js'

/** Hands what the hook returned to the test, as FieldLive would read it. */
function Reader({ onRead }: { onRead: (errors: FormErrors | undefined) => void }) {
  onRead(useFormErrors())
  return null
}

describe('the errors a form action returned', () => {
  it('reach a reader under the provider, one message, a list and a cleared field alike', () => {
    const errors: FormErrors = { email: 'Enter an email', tags: ['Too many', 'Too long'], name: undefined }
    const onRead = vi.fn()
    render(<FormErrorsContext value={errors}><div><Reader onRead={onRead} /></div></FormErrorsContext>)
    expect(onRead.mock.lastCall?.[0]).toBe(errors)
    expect(onRead.mock.lastCall?.[0]).toEqual({ email: 'Enter an email', tags: ['Too many', 'Too long'], name: undefined })
  })

  it('are undefined with no provider, so a field outside a form action can tell it from a form with no errors', () => {
    const onRead = vi.fn()
    render(<Reader onRead={onRead} />)
    expect(onRead.mock.lastCall).toEqual([undefined])
  })
})
