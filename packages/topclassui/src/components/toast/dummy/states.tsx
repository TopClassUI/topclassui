'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** Stands in for a request that settles after three seconds. */
const wait = () => new Promise<void>((resolve) => { setTimeout(resolve, 3000) })

/** A toast exists only once something adds it, so each state is one press away. */
export default function Demo() {
  const undo = () => {
    const id = toast.add({ title: 'Project archived', action: { label: 'Undo', onClick: () => { toast.close(id) } } })
  }
  const load = () => {
    toast.promise(wait(), { loading: 'Uploading', success: 'Uploaded', error: 'Upload failed' }).catch(() => undefined)
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => { toast.add({ title: 'Draft saved' }) }}>Neutral</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'primary', title: 'New version available' }) }}>Primary</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'success', title: 'Invitation sent' }) }}>Success</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'warning', title: 'Storage almost full' }) }}>Warning</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'danger', title: 'Could not save' }) }}>Danger</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'info', title: 'Maintenance tonight' }) }}>Info</Button>
      <Button
        variant="outline"
        onClick={() => { toast.add({ title: 'Invitation sent', description: 'Sara will get an email in a minute.' }) }}
      >
        With description
      </Button>
      <Button variant="outline" onClick={undo}>With action</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'warning', title: 'You are offline', duration: 0 }) }}>Sticky</Button>
      <Button
        variant="outline"
        onClick={() => { toast.add({ tone: 'danger', priority: 'high', title: 'Payment failed' }) }}
      >
        High priority
      </Button>
      <Button variant="outline" onClick={load}>Loading</Button>
    </div>
  )
}
