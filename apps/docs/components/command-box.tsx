// A command on one line with its copy button, as Home's hero, Install and the footer draw it (docs-site page 1).
import { getLabels } from 'topclassui/labels/get-labels'
import { BORDER, BORDER_STRONG } from 'topclassui/classes'

import type { Locale } from '../content/pages'
import { CopyButton } from './home/home-islands'

const BOX = {
  lg: `h-control-lg gap-3 bg-surface-raised ps-4.5 pe-2.5 text-sm ${BORDER_STRONG}`,
  md: `h-control-md gap-2.5 bg-page ps-3.5 pe-1.5 text-xs ${BORDER}`,
  sm: `h-control-sm gap-2 bg-page ps-2.5 pe-1 text-xs ${BORDER}`,
} as const

export interface CommandBoxProps {
  code: string
  locale: Locale
  size?: keyof typeof BOX
  /** Draws a muted $ before a shell command. */
  prompt?: boolean
  className?: string
}

export function CommandBox({ code, locale, size = 'md', prompt = false, className = '' }: CommandBoxProps) {
  const common = getLabels(locale).labels.common
  return (
    <div dir="ltr" className={`flex min-w-0 items-center rounded-control font-mono ${BOX[size]} ${className}`}>
      {prompt ? <span aria-hidden="true" className="text-muted">$</span> : null}
      <code translate="no" className="min-w-0 flex-1 truncate text-start text-body">{code}</code>
      <CopyButton code={code} label={`${common.copy} ${code}`} copied={common.copied} failed={common.copyFailed} />
    </div>
  )
}
