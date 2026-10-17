// Loaded into a live page by e2e/select.spec.ts: the reset cases of Switch, repeated for a Select (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the
// next defaults; a Select with no default, a controlled one, one outside its form tied to it by `form`, and a
// required one with nothing chosen.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '#components/select/index.js'

type Sent = [string, string][]
declare global { interface Window { selectSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.selectSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.selectSent = sent
}

const ITEMS = [{ value: 'a', label: 'Amman' }, { value: 'b', label: 'Beirut' }, { value: 'c', label: 'Cairo' }]

function Plain() {
  const [owned, setOwned] = useState<string | null>('a')
  return (
    <>
      <form id="plain">
        <Select aria-label="Plan" name="plan" items={ITEMS} defaultValue="a" />
        <Select aria-label="Empty" name="empty" items={ITEMS} />
        <Select aria-label="Owned" name="owned" items={ITEMS} value={owned} onValueChange={setOwned} />
        <output id="owner">{owned}</output>
        <button type="reset">Reset</button>
      </form>
      <Select aria-label="Far" name="far" form="plain" items={ITEMS} defaultValue="a" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Select aria-label="Pick" name="pick" items={ITEMS} defaultValue="a" />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { again: string }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    const again = data.get('again')
    return { again: typeof again === 'string' ? again : 'a' }
  }, { again: 'a' })
  return (
    <form id="echo" action={submit}>
      <Select aria-label="Again" name="again" items={ITEMS} defaultValue={defaults.again} />
      <button type="submit">Send</button>
    </form>
  )
}

function Required() {
  return (
    <form id="required" onSubmit={(event) => { event.preventDefault(); record('required', new FormData(event.currentTarget)) }}>
      <Select aria-label="Needed" name="needed" items={ITEMS} required />
      <button type="submit">Submit</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the Selects, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="select-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
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
