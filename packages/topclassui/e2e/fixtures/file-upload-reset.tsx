// Loaded into a live page by e2e/file-upload.spec.ts: the reset cases of Switch (unit-4.md, "Fixtures") for a file
// list. A plain form with a reset button, an upload outside it tied by `form`, and a form with a function action.
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { FileUpload } from '#components/file-upload/index.js'

type Sent = [string, string][]
declare global { interface Window { fileUploadSent?: Record<string, Sent[]> } }

/** What the form sent, in order, as the spec reads it: a file by its name. */
function record(form: string, data: FormData): void {
  const sent = window.fileUploadSent ?? {}
  sent[form] = [...(sent[form] ?? []), [...data.entries()].map(([key, value]): [string, string] => [key, typeof value === 'string' ? value : value.name])]
  window.fileUploadSent = sent
}

function Plain() {
  return (
    <>
      <form id="plain">
        <FileUpload aria-label="Docs" name="docs" maxFiles={3} />
        <button type="reset">Reset</button>
      </form>
      <FileUpload aria-label="Far" name="far" form="plain" />
    </>
  )
}

function Action() {
  return (
    <form id="action" action={async (data) => { await Promise.resolve(); record('action', data) }}>
      <FileUpload aria-label="Attach" name="attach" maxFiles={3} maxSize={5 * 1024 * 1024} />
      <button type="submit">Send</button>
    </form>
  )
}

function Fixture() {
  const root = useRef(null as HTMLDivElement | null)
  // The spec waits for this: the effects of the uploads, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div ref={root} id="file-upload-reset" style={{ display: 'grid', gap: 16, padding: 16 }}>
        <Plain />
        <Action />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
