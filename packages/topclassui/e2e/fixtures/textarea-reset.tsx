// Loaded into a live page by e2e/textarea.spec.ts. A textarea resets by itself: this page shows that the counter and the
// rows of the client half follow it. A plain form with a reset button, a disabled field, one outside its form tied to it
// by `form`, and a form with a function action, which React 19 resets once the action settles.
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Textarea } from '#components/textarea/index.js'

type Sent = [string, string][]
declare global { interface Window { textareaSent?: Sent[] } }

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the layout effects of the holders, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="textarea-reset" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <form id="plain">
          <Textarea aria-label="Bio" name="bio" defaultValue="Hello" autosize showCount maxLength={60} />
          <Textarea aria-label="Note" name="note" />
          <Textarea aria-label="Off" name="off" disabled defaultValue="off" />
          <button type="reset">Reset</button>
        </form>
        <Textarea aria-label="Far" name="far" form="plain" showCount />
        <form id="action" action={async (data) => { await Promise.resolve(); window.textareaSent = [...(window.textareaSent ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])] }}>
          <Textarea aria-label="Message" name="message" autosize showCount />
          <button type="submit">Send</button>
        </form>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
