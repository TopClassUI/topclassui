'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

/** An action under the text. It does not close the toast by itself, so Undo closes it by the id add() returned. */
export default function Demo() {
  const archive = () => {
    const id = toast.add({
      title: 'Project archived',
      action: { label: 'Undo', onClick: () => { toast.close(id) } },
    })
  }
  return <Button variant="outline" onClick={archive}>Archive</Button>
}
