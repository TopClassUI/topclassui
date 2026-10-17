'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** Twenty at once. Three show, the provider's limit; the next one appears each time one closes. */
export default function Demo() {
  const flood = () => {
    for (let n = 1; n <= 20; n++) toast.add({ title: `Message ${String(n)}`, duration: 0 })
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={flood}>Twenty messages</Button>
      <Button variant="outline" onClick={() => { toast.close() }}>Close all</Button>
    </div>
  )
}
