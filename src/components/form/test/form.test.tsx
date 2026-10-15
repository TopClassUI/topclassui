import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { FormErrors } from '#shared/form-errors.js'
import { markup } from '#test/markup.js'
import { FORM_DEFAULTS } from '../constants.js'
import { Form, FormAction } from '../index.js'

/** The form React's server renderer writes for a client function action: a post that throws, and a replay script. */
const THROWS = 'action="javascript:throw new Error(&#x27;React form unexpectedly submitted.&#x27;)"'

/** What a bundler makes of a Server Action, enough for React's server renderer: its post fields, kept through bind. */
function asServerAction<F extends (...args: never[]) => unknown>(action: F): F {
  const fields = () => ({ name: '$ACTION_ID_subscribe', method: 'POST', encType: 'multipart/form-data', action: '', data: null })
  return Object.assign(action, { $$FORM_ACTION: fields, bind: () => Object.assign(() => undefined, { $$FORM_ACTION: fields }) })
}
const post = () => asServerAction(async (formData: FormData) => { await Promise.resolve(formData) })
const answer = () => asServerAction((state: { errors?: Record<string, string> }) => state)

describe('Form writes a plain form', () => {
  it('with every attribute it is given, the action as written, and its children', () => {
    expect(markup(
      <Form action="/subscribe" method="post" id="sub" name="sub" aria-label="Subscribe" autoComplete="on" encType="multipart/form-data" target="_self">
        <input name="email" required />
      </Form>,
    )).toBe(
      '<form id="sub" name="sub" aria-label="Subscribe" autoComplete="on" action="/subscribe" encType="multipart/form-data" method="post" target="_self">'
      + '<input required="" name="email"/></form>',
    )
  })

  it('no noValidate, so the browser checks required before hydration and after; a caller can still ask for it', () => {
    expect(markup(<Form action="/x" />)).toBe('<form action="/x"></form>')
    expect(markup(<Form action="/x" noValidate />)).toBe('<form noValidate="" action="/x"></form>')
  })

  it('no class of its own: the caller className, merged with cn so the last of two conflicting classes wins', () => {
    expect(markup(<Form className="flex flex-col gap-4" />)).toBe('<form class="flex flex-col gap-4"></form>')
    expect(markup(<Form className="gap-2 gap-4" />)).toBe('<form class="gap-4"></form>')
  })

  it('a Server Action posts to the page with its id as a hidden field, which is how it works with no script', () => {
    expect(markup(<Form action={post()} />)).toBe(
      '<form action="" encType="multipart/form-data" method="POST"><input type="hidden" name="$ACTION_ID_subscribe"/></form>',
    )
  })
})

describe('FormAction in the server HTML', () => {
  it('a client function: the post that throws, no aria-busy, the children, and the replay script React adds', () => {
    const html = renderToString(<FormAction action={(state) => state} aria-label="F"><p>Fields</p></FormAction>)
    expect(html.slice(0, html.indexOf('<script>'))).toBe(`<form aria-label="F" ${THROWS}><p>Fields</p></form>`)
  })

  it('the first state is {}, and the same frozen object for every form', () => {
    expect(FORM_DEFAULTS.initialState).toEqual({})
    expect(Object.isFrozen(FORM_DEFAULTS.initialState)).toBe(true)
  })

  it('with a Server Action and permalink, the form posts to the permalink before hydration', () => {
    expect(markup(<FormAction action={answer()} permalink="/subscribe" />)).toBe(
      '<form action="/subscribe" encType="multipart/form-data" method="POST"><input type="hidden" name="$ACTION_ID_subscribe"/></form>',
    )
    expect(markup(<FormAction action={answer()} />)).toMatch(/^<form action="" /)
  })

  it('a function child is called with the starting state and pending false', () => {
    const html = markup(
      <FormAction action={(state: { errors?: FormErrors, message?: string }) => state} initialState={{ message: 'Start' }}>
        {(state, pending) => <p>{`${state.message ?? ''} ${String(pending)}`}</p>}
      </FormAction>,
    )
    expect(html).toContain('<p>Start false</p>')
  })
})
