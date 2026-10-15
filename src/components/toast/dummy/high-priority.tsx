'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** priority high: a screen reader announces it at once, as an alert, instead of after what it is reading. */
export default function Demo() {
  return (
    <Button
      variant="outline"
      onClick={() => { toast.add({ tone: 'danger', priority: 'high', title: 'Payment failed', description: 'Your card was declined.' }) }}
    >
      Pay now
    </Button>
  )
}
