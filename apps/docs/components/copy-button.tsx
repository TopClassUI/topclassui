'use client'

import { useState } from 'react'
import { HOVER, ICON_BUTTON } from 'topclassui/classes'
import { Svg } from 'topclassui/svg'
import { check } from 'topclassui/icons/check'
import { copy } from 'topclassui/icons/copy'

export interface CopyButtonProps {
  code: string
  label: string
  copied: string
  failed: string
}

/** One button that copies a command and says so in a live region; the tick stays until the next press. */
export function CopyButton({ code, label, copied, failed }: CopyButtonProps) {
  const [status, setStatus] = useState('')
  const press = () => {
    navigator.clipboard.writeText(code).then(() => { setStatus(copied) }, () => { setStatus(failed) })
  }
  return (
    <>
      <button type="button" aria-label={label} onClick={press} className={`${ICON_BUTTON} ${HOVER.ghost} text-muted`}>
        {status === copied ? <Svg icon={check} size="1rem" aria-hidden="true" className="docs-tick" /> : <Svg icon={copy} size="1rem" aria-hidden="true" />}
      </button>
      <span role="status" className="sr-only">{status}</span>
    </>
  )
}
