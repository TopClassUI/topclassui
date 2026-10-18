'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

const PARTS = ['Install', 'Usage', 'Theming', 'Questions'] as const

/** A page longer than the screen under a toast that stays, a link in the middle of each screen. Tab to the last, and it stops above the stack. */
export default function Demo() {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() => { toast.add({ tone: 'warning', title: 'You are offline', description: 'Changes are kept here until you reconnect.', duration: 0 }) }}
      >
        Go offline
      </Button>
      {PARTS.map((part) => (
        <section key={part} id={part.toLowerCase()} aria-label={part} className="flex min-h-dvh flex-col justify-center">
          <Button variant="link" render={<a href={`#${part.toLowerCase()}`} />}>{`Read about ${part}`}</Button>
        </section>
      ))}
    </div>
  )
}
