// Loaded into a live page by e2e/combobox.spec.ts: the reset cases of Switch, repeated for a combobox (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the
// next defaults; a combobox with no default, a controlled one, one outside its form tied to it by `form`.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Combobox } from '#components/combobox/index.js'

type Sent = [string, string][]
declare global { interface Window { comboboxSent?: Record<string, Sent[]> } }

const ITEMS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
]

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.comboboxSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.comboboxSent = sent
}

function Plain() {
  const [owned, setOwned] = useState<string | null>('a')
  return (
    <>
      <form id="plain" style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <Combobox aria-label="Plan" name="plan" items={ITEMS} defaultValue="a" />
        <Combobox aria-label="Empty" name="empty" items={ITEMS} />
        <Combobox aria-label="Owned" name="owned" items={ITEMS} value={owned} onValueChange={setOwned} />
        <output id="owner">{owned ?? 'none'}</output>
        <button type="reset">Reset</button>
      </form>
      <Combobox aria-label="Far" name="far" form="plain" items={ITEMS} defaultValue="a" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Combobox aria-label="Pick" name="pick" items={ITEMS} defaultValue="a" />
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
      <Combobox aria-label="Again" name="again" items={ITEMS} defaultValue={defaults.again} />
      <button type="submit">Send</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the comboboxes, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="combobox-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
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
