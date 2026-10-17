// Loaded into a live page by e2e/checkbox.spec.ts: the reset cases of Switch, repeated for a checkbox (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the
// next defaults; a controlled box, an indeterminate one, and one outside its form tied to it by `form`.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Checkbox } from '#components/checkbox/index.js'

type Sent = [string, string][]
declare global { interface Window { checkboxSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.checkboxSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.checkboxSent = sent
}

function Plain() {
  const [owned, setOwned] = useState(false)
  return (
    <>
      <form id="plain">
        <Checkbox aria-label="Terms" name="terms" defaultChecked />
        <Checkbox aria-label="News" name="news" />
        <Checkbox aria-label="Owned" name="owned" checked={owned} onCheckedChange={setOwned} />
        <Checkbox aria-label="Mixed" name="mixed" indeterminate />
        <output id="owner">{String(owned)}</output>
        <button type="reset">Reset</button>
      </form>
      <Checkbox aria-label="Far" name="far" form="plain" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Checkbox aria-label="Agree" name="agree" />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { agree: boolean }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    return { agree: data.get('agree') === 'on' }
  }, { agree: false })
  return (
    <form id="echo" action={submit}>
      <Checkbox aria-label="Agree again" name="agree" defaultChecked={defaults.agree} />
      <button type="submit">Send</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the boxes, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="checkbox-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
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
