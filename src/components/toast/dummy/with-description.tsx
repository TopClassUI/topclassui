'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** The drawn sample: a title and a line under it. */
export default function Demo() {
  return (
    <Button
      variant="outline"
      onClick={() => { toast.add({ tone: 'success', title: 'Invitation sent', description: 'They get an email within the minute.' }) }}
    >
      Invite
    </Button>
  )
}
