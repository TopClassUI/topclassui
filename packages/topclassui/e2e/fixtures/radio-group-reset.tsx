// Loaded into a live page by e2e/radio-group.spec.ts: the reset cases of Switch, repeated for a radio group (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the
// next defaults; a group with no default, a controlled group, one outside its form tied to it by `form`, and a group
// that counts the calls of its handler.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'

type Sent = [string, string][]
declare global { interface Window { radioGroupSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.radioGroupSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.radioGroupSent = sent
}

/** Two radios, named by a prefix so the spec can find each one: "Plan A" and "Plan B". */
function Two({ label }: { label: string }) {
  return (
    <>
      <RadioGroupItem value="a">{`${label} A`}</RadioGroupItem>
      <RadioGroupItem value="b">{`${label} B`}</RadioGroupItem>
    </>
  )
}

function Plain() {
  const [owned, setOwned] = useState('a')
  return (
    <>
      <form id="plain">
        <RadioGroupRoot aria-label="Plan" name="plan" defaultValue="a" orientation="horizontal"><Two label="Plan" /></RadioGroupRoot>
        <RadioGroupRoot aria-label="Empty" name="empty" orientation="horizontal"><Two label="Empty" /></RadioGroupRoot>
        <RadioGroupRoot aria-label="Owned" name="owned" value={owned} onValueChange={setOwned} orientation="horizontal"><Two label="Owned" /></RadioGroupRoot>
        <output id="owner">{owned}</output>
        <button type="reset">Reset</button>
      </form>
      <RadioGroupRoot aria-label="Far" name="far" form="plain" defaultValue="a" orientation="horizontal"><Two label="Far" /></RadioGroupRoot>
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <RadioGroupRoot aria-label="Pick" name="pick" defaultValue="a" orientation="horizontal"><Two label="Pick" /></RadioGroupRoot>
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
      <RadioGroupRoot aria-label="Again" name="again" defaultValue={defaults.again} orientation="horizontal"><Two label="Again" /></RadioGroupRoot>
      <button type="submit">Send</button>
    </form>
  )
}

function Counted() {
  const [calls, setCalls] = useState<string[]>([])
  return (
    <div>
      <RadioGroupRoot aria-label="Counted" orientation="horizontal" onValueChange={(value) => { setCalls((all) => [...all, value]) }}>
        <Two label="Counted" />
      </RadioGroupRoot>
      <output id="calls">{calls.join(',')}</output>
    </div>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the groups, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="radio-group-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <Plain />
        <Action />
        <Echo />
        <Counted />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
