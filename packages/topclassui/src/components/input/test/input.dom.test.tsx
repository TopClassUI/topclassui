import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from '../index.js'

const box = (name: string) => screen.getByRole<HTMLInputElement>('textbox', { name })

describe('typing', () => {
  it('takes what is typed and reports each change', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="Email" onChange={onChange} />)
    await userEvent.type(box('Email'), 'omar')
    expect(box('Email').value).toBe('omar')
    expect(onChange).toHaveBeenCalledTimes(4)
  })

  it('starts from defaultValue and stays editable', async () => {
    render(<Input aria-label="Email" defaultValue="a" />)
    await userEvent.type(box('Email'), 'b')
    expect(box('Email').value).toBe('ab')
  })

  it('takes focus by keyboard, so Tab can reach it', async () => {
    render(<Input aria-label="Email" />)
    await userEvent.tab()
    expect(document.activeElement).toBe(box('Email'))
  })
})

describe('the name', () => {
  it('is the label that points at its id', () => {
    render(<><label htmlFor="email">Work email</label><Input id="email" /></>)
    expect(box('Work email').id).toBe('email')
  })

  it('is the text aria-labelledby points at', () => {
    render(<><span id="email-label">Billing email</span><Input aria-labelledby="email-label" /></>)
    expect(box('Billing email')).toBeTruthy()
  })
})

describe('the cap reaches the element', () => {
  it('is the property the browser enforces, by type', () => {
    render(<><Input aria-label="Plain" /><Input aria-label="Phone" type="tel" /></>)
    expect(box('Plain').maxLength).toBe(512)
    expect(box('Phone').maxLength).toBe(32)
  })

  it('is absent for null and on a number field', () => {
    render(<><Input aria-label="Open" maxLength={null} /><Input aria-label="Age" type="number" /></>)
    expect(box('Open').hasAttribute('maxlength')).toBe(false)
    expect(screen.getByRole('spinbutton', { name: 'Age' }).hasAttribute('maxlength')).toBe(false)
  })

  it('is absent on a checkbox and a date, where HTML does not allow it', () => {
    render(<><Input aria-label="Agree" type="checkbox" maxLength={3} /><Input id="start" type="date" /></>)
    expect(screen.getByRole('checkbox', { name: 'Agree' }).hasAttribute('maxlength')).toBe(false)
    const date = document.getElementById('start')
    expect(date?.getAttribute('type')).toBe('date')
    expect(date?.hasAttribute('maxlength')).toBe(false)
  })
})

describe('when it cannot be used', () => {
  it('takes no typing and no focus while disabled', async () => {
    const onChange = vi.fn()
    render(<><Input aria-label="First" disabled onChange={onChange} /><Input aria-label="Second" /></>)
    await userEvent.type(box('First'), 'x')
    expect(box('First').value).toBe('')
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.tab()
    expect(document.activeElement).toBe(box('Second'))
  })

  it('keeps its value while read-only, and still takes focus', async () => {
    render(<Input aria-label="Email" readOnly defaultValue="a@b.co" />)
    await userEvent.type(box('Email'), 'x')
    expect(box('Email').value).toBe('a@b.co')
    expect(document.activeElement).toBe(box('Email'))
  })

  it('is announced as invalid and as required', () => {
    render(<Input aria-label="Email" invalid required />)
    expect(box('Email').getAttribute('aria-invalid')).toBe('true')
    expect(box('Email').required).toBe(true)
  })
})

describe('ref', () => {
  it('is a normal prop and receives the input', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input aria-label="Email" ref={ref} />)
    expect(ref.current).toBe(box('Email'))
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLInputElement | null }
    const { unmount } = render(<Input aria-label="Email" ref={ref} />)
    unmount()
    expect(ref.current).toBeNull()
  })
})

describe('controlled', () => {
  it('shows the value it is given', () => {
    render(<Input aria-label="Email" value="fixed" onChange={() => undefined} />)
    expect(box('Email').value).toBe('fixed')
  })
})
