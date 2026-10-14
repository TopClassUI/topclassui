'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** The six tones. Four carry an icon, so the meaning never rests on colour alone; neutral and primary carry none. */
export default function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => { toast.add({ title: 'Draft saved' }) }}>Neutral</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'primary', title: 'New version available' }) }}>Primary</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'success', title: 'Invitation sent' }) }}>Success</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'warning', title: 'Storage almost full' }) }}>Warning</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'danger', title: 'Could not save' }) }}>Danger</Button>
      <Button variant="outline" onClick={() => { toast.add({ tone: 'info', title: 'Maintenance tonight' }) }}>Info</Button>
    </div>
  )
}
