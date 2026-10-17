'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** Stands in for a request: it settles after a second, one way or the other. */
const upload = (succeeds: boolean) => new Promise<number>((resolve, reject) => {
  setTimeout(() => { if (succeeds) resolve(3); else reject(new Error('The server did not answer.')) }, 1000)
})

/** One toast for the whole request: a spinner, then the success or the error icon and text in its place.
 * promise() hands the rejection back, so the caller catches it. */
export default function Demo() {
  const send = (succeeds: boolean) => {
    toast.promise(upload(succeeds), {
      loading: 'Uploading',
      success: (count) => ({ title: 'Uploaded', description: `${String(count)} files are in the project.` }),
      error: (error) => ({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Try again.' }),
    }).catch(() => undefined)
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => { send(true) }}>Upload</Button>
      <Button variant="outline" onClick={() => { send(false) }}>Upload and fail</Button>
    </div>
  )
}
