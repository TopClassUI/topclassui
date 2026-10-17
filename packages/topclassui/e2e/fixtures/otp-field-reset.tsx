// Loaded into a live page by e2e/otp-field.spec.ts: the reset cases of Switch, repeated for a code field (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the
// next defaults; a field with no default, a controlled field, and one outside its form tied to it by `form`. Last, two
// fields with autoSubmit, each followed by a form whose field mounts after it: only the field's own form is sent.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField } from '#components/otp-field/index.js'

type Sent = [string, string][]
declare global { interface Window { otpFieldSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.otpFieldSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.otpFieldSent = sent
}

/** A field of four cells named by the text before it, so the spec finds its first cell by that name. */
function Code({ label, ...props }: { label: string } & Omit<Parameters<typeof OTPField>[0], 'id' | 'aria-labelledby'>) {
  const id = label.toLowerCase()
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span id={`${id}-label`}>{label}</span>
      <OTPField aria-labelledby={`${id}-label`} length={4} {...props} />
    </div>
  )
}

function Plain() {
  const [owned, setOwned] = useState('12')
  return (
    <>
      <form id="plain">
        <Code label="Plan" name="plan" defaultValue="12" />
        <Code label="Empty" name="empty" />
        <Code label="Owned" name="owned" value={owned} onValueChange={setOwned} />
        <output id="owner">{owned}</output>
        <button type="reset">Reset</button>
      </form>
      <Code label="Far" name="far" form="plain" defaultValue="12" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Code label="Pick" name="pick" defaultValue="12" />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { again: string }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    const again = data.get('again')
    return { again: typeof again === 'string' ? again : '' }
  }, { again: '12' })
  return (
    <form id="echo" action={submit}>
      <Code label="Again" name="again" defaultValue={defaults.again} />
      <button type="submit">Send</button>
    </form>
  )
}

/** autoSubmit sends the field's form through its action: the one it sits in, or the one its `form` names. */
function Auto() {
  return (
    <>
      <form id="auto" action={(data) => { record('auto', data) }}><Code label="Auto" name="auto" autoSubmit /></form>
      <form id="outer" action={(data) => { record('outer', data) }}><Code label="Tied" name="tied" form="tied" autoSubmit /></form>
      <form id="tied" action={(data) => { record('tied', data) }} />
      <form id="later" action={(data) => { record('later', data) }}><Code label="Later" name="later" /></form>
    </>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the fields, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="otp-field-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <Plain />
        <Action />
        <Echo />
        <Auto />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
