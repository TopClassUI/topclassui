'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** duration 0: it stays until the x, a swipe or Escape closes it. */
export default function Demo() {
  return (
    <Button
      variant="outline"
      onClick={() => { toast.add({ tone: 'warning', title: 'You are offline', description: 'Changes are kept here until you reconnect.', duration: 0 }) }}
    >
      Go offline
    </Button>
  )
}
