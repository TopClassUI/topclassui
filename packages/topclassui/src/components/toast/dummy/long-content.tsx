'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'

const WORD = 'a'.repeat(300)
const PARAGRAPH = 'Every file of the project is checked again before it is published, and the ones that changed are listed here. '.repeat(4)

/** Hostile content: a 300-letter word as the title and as the text, a long action label, and three long toasts. */
export default function Demo() {
  const words = () => {
    toast.add({ tone: 'info', title: WORD, description: WORD, action: { label: `Open the full report of ${WORD}`, onClick: () => undefined } })
  }
  const tall = () => {
    for (const title of ['First check', 'Second check', 'Third check']) {
      toast.add({ tone: 'warning', title, description: PARAGRAPH, duration: 0 })
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={words}>One long word</Button>
      <Button variant="outline" onClick={tall}>Three tall toasts</Button>
    </div>
  )
}
