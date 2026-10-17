// Loaded into a live page by e2e/number-field.spec.ts: the reset cases of Switch, for a number field (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the next
// defaults; a controlled field, an empty one, and one outside its form tied to it by `form`.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '#components/number-field/index.js'

type Sent = [string, string][]
declare global { interface Window { numberFieldSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.numberFieldSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.numberFieldSent = sent
}

function Plain() {
  const [owned, setOwned] = useState<number | null>(5)
  return (
    <>
      <form id="plain">
        <NumberField aria-label="Guests" name="guests" defaultValue={2} max={8} />
        <NumberField aria-label="Rooms" name="rooms" />
        <NumberField aria-label="Owned" name="owned" value={owned} onValueChange={setOwned} />
        <output id="owner">{String(owned)}</output>
        <button type="reset">Reset</button>
      </form>
      <NumberField aria-label="Far" name="far" form="plain" defaultValue={1} />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <NumberField aria-label="Seats" name="seats" defaultValue={1} />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { seats: number }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    return { seats: Number(data.get('seats')) }
  }, { seats: 1 })
  return (
    <form id="echo" action={submit}>
      <NumberField aria-label="Seats again" name="seats" defaultValue={defaults.seats} />
      <button type="submit">Send</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the fields, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="number-field-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <Plain />
        <Action />
        <Echo />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
