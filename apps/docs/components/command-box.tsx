// A command on one line with its copy button, as Home's hero, Install and the footer draw it (docs-site page 1).
import { getLabels } from 'topclassui/labels/get-labels'
import { BORDER, BORDER_STRONG } from 'topclassui/classes'

import type { Locale } from '../content/pages'
import { CopyButton } from './home/home-islands'

/** The hero's drawn 56 px box on the raised surface, Install's 44 px well on the page, and the footer's small one. */
const BOX = {
  lg: `h-control-xl gap-3 bg-surface-raised py-3.25 ps-4.5 pe-2.5 text-sm ${BORDER_STRONG}`,
  md: `h-[2.75rem] gap-2.5 bg-page py-2.75 ps-3.5 pe-2.5 text-xs/[1.7] ${BORDER}`,
  sm: `h-control-sm gap-2 bg-page ps-2.5 pe-1 text-xs ${BORDER}`,
} as const

/** The hero's copy button is the drawn 32 by 28 px filled chip; Install's 14 px icon keeps its 24 px target and ends where the icon is drawn. */
const COPY = { lg: 'bg-surface px-2 py-1.5', md: '-me-1.25', sm: '' } as const satisfies Record<keyof typeof BOX, string>

const COPY_ICON = { lg: '1rem', md: '0.875rem', sm: '1rem' } as const satisfies Record<keyof typeof BOX, string>

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
      <CopyButton code={code} label={`${common.copy} ${code}`} copied={common.copied} failed={common.copyFailed} iconSize={COPY_ICON[size]} className={COPY[size]} />
    </div>
  )
}
