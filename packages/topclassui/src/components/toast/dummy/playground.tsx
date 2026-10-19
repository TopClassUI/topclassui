'use client'

import { Button } from '#components/button/index.js'
import { ToastStage, toast } from '../index.js'
import type { ToastDesignProps } from '../index.js'

const TITLE = 'Project created'
const DESCRIPTION = 'You can invite your team now.'

/** The docs stage: the Try it controls set the options of the toast the press adds. With `stage`, the frame's toast
 * also rests in the stage's bottom-end corner, success unless Try it says otherwise. */
export default function Demo({ stage = false, ...props }: ToastDesignProps & { stage?: boolean } = {}) {
  const button = (
    <Button variant="outline" onClick={() => { toast.add({ ...props, title: TITLE, description: DESCRIPTION }) }}>
      Show a toast
    </Button>
  )
  if (!stage) return button
  return (
    <ToastStage toast={{ tone: 'success', ...props, title: TITLE, description: DESCRIPTION }} className="min-h-60 w-full">
      {button}
    </ToastStage>
  )
}
