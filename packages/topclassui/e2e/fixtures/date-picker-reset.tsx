// Loaded into a live page by e2e/date-picker.spec.ts: the reset cases of Switch, repeated for a DatePicker. A plain
// form with a reset button, a form with a function action, and one whose action returns the next default; one with no
// default, a controlled one, one outside its form tied to it by `form`, and a required one with nothing chosen.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '#components/date-picker/index.js'

type Sent = [string, string][]
declare global { interface Window { datePickerSent?: Record<string, Sent[]>, datePickerHeard?: string[] } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.datePickerSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.datePickerSent = sent
}

function Plain() {
  const [owned, setOwned] = useState<string | null>('2026-09-22')
  return (
    <>
      <form id="plain" onInput={(event) => { window.datePickerHeard = [...(window.datePickerHeard ?? []), (event.target as HTMLInputElement).value] }}>
        <DatePicker aria-label="Plan" name="plan" defaultValue="2026-09-22" />
        <DatePicker aria-label="Empty" name="empty" />
        <DatePicker aria-label="Owned" name="owned" value={owned} onValueChange={setOwned} />
        <output id="owner">{owned}</output>
        <button type="reset">Reset</button>
      </form>
      <DatePicker aria-label="Far" name="far" form="plain" defaultValue="2026-09-22" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <DatePicker aria-label="Pick" name="pick" defaultValue="2026-09-22" />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { again: string }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    const again = data.get('again')
    return { again: typeof again === 'string' ? again : '2026-09-22' }
  }, { again: '2026-09-22' })
  return (
    <form id="echo" action={submit}>
      <DatePicker aria-label="Again" name="again" defaultValue={defaults.again} />
      <button type="submit">Send</button>
    </form>
  )
}

function Required() {
  return (
    <form id="required" onSubmit={(event) => { event.preventDefault(); record('required', new FormData(event.currentTarget)) }}>
      <DatePicker aria-label="Needed" name="needed" required />
      <button type="submit">Submit</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the DatePickers, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="date-picker-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <Plain />
        <Action />
        <Echo />
        <Required />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
