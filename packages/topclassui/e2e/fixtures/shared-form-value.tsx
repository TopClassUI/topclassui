// Loaded into a live page by e2e/shared-form-value.spec.ts: useFormValue driving native stand-ins before any control holds it.
import { type CSSProperties, useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { type FormValueSync, useFormValue } from '#shared/use-form-value.js'

type Sent = [string, string][]
declare global { interface Window { formValueSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.formValueSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.formValueSent = sent
}

/** Base UI's own hidden input is clipped the same way: out of sight, still in the form. */
const CLIPPED: CSSProperties = { position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', clipPath: 'inset(50%)' }

const syncChecked: FormValueSync<boolean> = (value, input) => { if (input) input.checked = value }

/** A Switch or a Checkbox in miniature: a native checkbox, reached through inputRef, written back by sync. */
function Check({ name, defaultChecked = false, checked, onCheckedChange, form }: {
  name: string, defaultChecked?: boolean, checked?: boolean, onCheckedChange?: (next: boolean) => void, form?: string,
}) {
  const state = useFormValue({ value: checked, defaultValue: defaultChecked, sync: syncChecked })
  return (
    <label>
      <input
        type="checkbox" id={name} name={name} form={form} ref={state.inputRef} checked={state.value}
        onChange={(event) => { onCheckedChange?.(event.target.checked); state.setValue(event.target.checked) }}
      />
      {name}
      <span data-shown={name}>{String(state.value)}</span>
    </label>
  )
}

/** A Select in miniature: a hidden text input inside a root, reached through rootRef, with no sync. */
function Pick({ name, defaultValue, form }: { name: string, defaultValue: string, form?: string }) {
  const state = useFormValue({ defaultValue })
  return (
    <div ref={state.rootRef} id={name} role="group" aria-label={name}>
      <input type="text" name={name} form={form} value={state.value} readOnly aria-hidden tabIndex={-1} style={CLIPPED} />
      {['s', 'm', 'l'].map((option) => (
        <button type="button" key={option} aria-pressed={state.value === option} onClick={() => { state.setValue(option) }}>{option}</button>
      ))}
      <span data-shown>{state.value}</span>
    </div>
  )
}

function Plain() {
  const [owned, setOwned] = useState(false)
  return (
    <>
      <form id="plain">
        <Check name="agree" />
        <Check name="news" defaultChecked />
        <Check name="owned" checked={owned} onCheckedChange={setOwned} />
        <span id="owner">{String(owned)}</span>
        <Pick name="size" defaultValue="m" />
        <button type="reset">Reset</button>
      </form>
      <Check name="outside" form="plain" />
      <Pick name="far" defaultValue="m" form="plain" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Check name="agree2" />
      <Pick name="size2" defaultValue="m" />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { agree: boolean, size: string }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    const size = data.get('size3')
    return { agree: data.get('agree3') === 'on', size: typeof size === 'string' ? size : '' }
  }, { agree: false, size: 'm' })
  return (
    <form id="echo" action={submit}>
      <Check name="agree3" defaultChecked={defaults.agree} />
      <Pick name="size3" defaultValue={defaults.size} />
      <button type="submit">Send</button>
    </form>
  )
}

function Cancelled() {
  const form = useRef(null as HTMLFormElement | null)
  useEffect(() => {
    const node = form.current
    const keep = (event: Event) => { event.preventDefault() }
    node?.addEventListener('reset', keep)
    return () => { node?.removeEventListener('reset', keep) }
  }, [])
  return (
    <form id="cancelled" ref={form}>
      <Check name="agree4" />
      <Pick name="size4" defaultValue="m" />
      <button type="reset">Reset</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the controls, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return <div ref={root} id="form-value-fixture"><Plain /><Action /><Echo /><Cancelled /></div>
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
