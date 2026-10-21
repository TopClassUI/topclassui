'use client'

import { useState } from 'react'
import { HOVER, ICON_BUTTON } from 'topclassui/classes'
import { Svg } from 'topclassui/svg'
import { check } from 'topclassui/icons/check'
import { copy } from 'topclassui/icons/copy'

import { CODE_COPY, CODE_COPY_ICON } from './classes'

export interface CopyButtonProps {
  code: string
  label: string
  copied: string
  failed: string
  /** The word beside the icon, as a code block's header draws it; without it the button is the icon alone. */
  text?: string
  /** Extra classes for the icon-only button, such as the filled chip the hero's install line draws. */
  className?: string
  /** The icon-only button's icon, 1rem unless its box draws it smaller. */
  iconSize?: string
}

/** One button that copies a command and says so in a live region; the tick stays until the next press. */
export function CopyButton({ code, label, copied, failed, text, className = '', iconSize = '1rem' }: CopyButtonProps) {
  const [status, setStatus] = useState('')
  const press = () => {
    navigator.clipboard.writeText(code).then(() => { setStatus(copied) }, () => { setStatus(failed) })
  }
  const size = text === undefined ? iconSize : '0.875rem'
  const icon = status === copied ? <Svg icon={check} size={size} aria-hidden="true" className="docs-tick" /> : <Svg icon={copy} size={size} aria-hidden="true" />
  return (
    <>
      {text === undefined ? (
        <button type="button" aria-label={label} onClick={press} className={`${ICON_BUTTON} ${HOVER.ghost} text-muted ${className}`}>{icon}</button>
      ) : (
        <button type="button" aria-label={label} onClick={press} className={CODE_COPY}>
          <span className={CODE_COPY_ICON}>{icon}</span>
          <span>{text}</span>
        </button>
      )}
      <span role="status" className="sr-only">{status}</span>
    </>
  )
}
