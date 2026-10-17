// Loaded into a live page by e2e/segmented-control.spec.ts: the reset cases of Switch, repeated for a segmented control
// (unit-4.md, "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action
// returns the next defaults; a controlled track, one outside its form tied to it by `form`, and a track that counts
// the calls of its handler. A segmented control always has a default, so there is no empty case.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { SegmentedControlItem, SegmentedControlRoot } from '#components/segmented-control/index.js'

type Sent = [string, string][]
declare global { interface Window { segmentedSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.segmentedSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.segmentedSent = sent
}

/** Three segments, named by a prefix so the spec can find each one: "Plan A", "Plan B" and "Plan C". */
function Three({ label }: { label: string }) {
  return (
    <>
      <SegmentedControlItem value="a">{`${label} A`}</SegmentedControlItem>
      <SegmentedControlItem value="b">{`${label} B`}</SegmentedControlItem>
      <SegmentedControlItem value="c">{`${label} C`}</SegmentedControlItem>
    </>
  )
}

function Plain() {
  const [owned, setOwned] = useState('c')
  return (
    <>
      <form id="plain">
        <SegmentedControlRoot aria-label="Plan" name="plan" defaultValue="a"><Three label="Plan" /></SegmentedControlRoot>
        <SegmentedControlRoot aria-label="Owned" name="owned" value={owned} onValueChange={setOwned}><Three label="Owned" /></SegmentedControlRoot>
        <output id="owner">{owned}</output>
        <button type="reset">Reset</button>
      </form>
      <SegmentedControlRoot aria-label="Far" name="far" form="plain" defaultValue="a"><Three label="Far" /></SegmentedControlRoot>
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <SegmentedControlRoot aria-label="Pick" name="pick" defaultValue="a"><Three label="Pick" /></SegmentedControlRoot>
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
      <SegmentedControlRoot aria-label="Again" name="again" defaultValue={defaults.again}><Three label="Again" /></SegmentedControlRoot>
      <button type="submit">Send</button>
    </form>
  )
}

function Counted() {
  const [calls, setCalls] = useState([] as string[])
  return (
    <div>
      <SegmentedControlRoot aria-label="Counted" defaultValue="a" onValueChange={(value) => { setCalls((all) => [...all, value]) }}>
        <Three label="Counted" />
      </SegmentedControlRoot>
      <output id="calls">{calls.join(',')}</output>
    </div>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the tracks, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="segmented-control-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
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
