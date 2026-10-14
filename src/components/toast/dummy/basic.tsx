'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** One press, one toast. The viewport is already there: TopClassProvider mounts it. */
export default function Demo() {
  return (
    <Button variant="outline" onClick={() => { toast.add({ title: 'Project created' }) }}>
      Create project
    </Button>
  )
}
