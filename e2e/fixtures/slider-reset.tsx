// Loaded into a live page by e2e/slider.spec.ts: the reset cases of Switch, repeated for a slider (unit-4.md,
// "Fixtures"). A plain form with a reset button, a form with a function action, and one whose action returns the next
// defaults; one thumb, a range, a slider with no default, a controlled one, and one outside its form tied to it by `form`.
import { useActionState, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Slider } from '#components/slider/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

type Sent = [string, string][]
declare global { interface Window { sliderSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it. */
function record(form: string, data: FormData): void {
  const sent = window.sliderSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.sliderSent = sent
}

function Plain() {
  const [owned, setOwned] = useState(30)
  return (
    <>
      <form id="plain" style={{ display: 'grid', gap: 8 }}>
        <Slider aria-label="Volume" name="volume" defaultValue={60} />
        <Slider aria-label="Price" name="price" defaultValue={[20, 80]} />
        <Slider aria-label="Empty" name="empty" min={5} />
        <Slider aria-label="Owned" name="owned" value={owned} onValueChange={setOwned} />
        <output id="owner">{owned}</output>
        <button type="reset">Reset</button>
      </form>
      <Slider aria-label="Far" name="far" form="plain" defaultValue={25} />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <Slider aria-label="Pick" name="pick" defaultValue={[10, 90]} />
      <button type="submit">Send</button>
    </form>
  )
}

function Echo() {
  const [defaults, submit] = useActionState(async (_previous: { again: number }, data: FormData) => {
    await Promise.resolve()
    record('echo', data)
    return { again: Number(data.get('again') ?? 50) }
  }, { again: 50 })
  return (
    <form id="echo" action={submit}>
      <Slider aria-label="Again" name="again" defaultValue={defaults.again} />
      <button type="submit">Send</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the sliders, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="slider-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
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
