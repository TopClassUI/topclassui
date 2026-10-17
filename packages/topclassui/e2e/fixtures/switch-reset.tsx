// Loaded into a live page by e2e/switch.spec.ts: the reset cases every later client control repeats (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the
// next defaults; a controlled switch, and one outside its form tied to it by `form`.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Switch } from '#components/switch/index.js'

type Sent = [string, string][]
declare global { interface Window { switchSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.switchSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.switchSent = sent
}

function Plain() {
  const [owned, setOwned] = useState(false)
  return (
    <>
      <form id="plain">
        <Switch aria-label="Digest" name="digest" defaultChecked />
        <Switch aria-label="News" name="news" />
        <Switch aria-label="Owned" name="owned" checked={owned} onCheckedChange={setOwned} />
        <output id="owner">{String(owned)}</output>
        <button type="reset">Reset</button>
      </form>
      <Switch aria-label="Far" name="far" form="plain" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Switch aria-label="Agree" name="agree" />
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
      <Switch aria-label="Agree again" name="agree" defaultChecked={defaults.agree} />
      <button type="submit">Send</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the switches, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="switch-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
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
