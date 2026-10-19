'use client'

import { Button } from '#components/button/index.js'
import { toast } from '../index.js'
import type { ToastDesignProps } from '../index.js'

/** The docs stage: the Try it controls set the options of the toast the press adds. */
export default function Demo(props: ToastDesignProps = {}) {
  return (
    <Button
      variant="outline"
      onClick={() => { toast.add({ ...props, title: 'Project created', description: 'You can invite your team now.' }) }}
    >
      Show a toast
    </Button>
  )
}
