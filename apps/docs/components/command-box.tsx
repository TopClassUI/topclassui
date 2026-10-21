// A command on one line with its copy button, as Home's hero, Install and the footer draw it (docs-site page 1).
import { getLabels } from 'topclassui/labels/get-labels'
import { BORDER, BORDER_STRONG } from 'topclassui/classes'

import type { Locale } from '../content/pages'
import { CopyButton } from './home/home-islands'

const BOX = {
  lg: 'h-control-lg gap-3 bg-surface-raised ps-4.5 pe-2.5 text-sm',
  md: 'h-control-md gap-2.5 bg-page ps-3.5 pe-1.5 text-xs',
  /** The footer's chip as drawn: 29 px, 10 px mono; the 24 px copy target leaves 5.5 px around its 13 px icon, so 2.5 px more puts it the drawn 8 px from the text and the end. */
  sm: 'min-h-[1.8125rem] gap-[0.15625rem] bg-page ps-2.5 pe-[0.15625rem] text-[0.625rem]',
} as const

const EDGE = { lg: BORDER_STRONG, md: BORDER, sm: BORDER } as const satisfies Record<keyof typeof BOX, string>

/** The hero's copy button is the drawn 28 px filled chip; the smaller boxes keep the bare icon. */
const COPY = { lg: 'size-7 bg-surface', md: '', sm: '' } as const satisfies Record<keyof typeof BOX, string>

const COPY_ICON = { lg: '1rem', md: '1rem', sm: '0.8125rem' } as const satisfies Record<keyof typeof BOX, string>

export interface CommandBoxProps {
  code: string
  locale: Locale
  size?: keyof typeof BOX
  /** Draws a muted $ before a shell command. */
  prompt?: boolean
  /** No line around the box: a well sunk into its card, as Home's Install cards draw it. */
  bare?: boolean
  className?: string
}

export function CommandBox({ code, locale, size = 'md', prompt = false, bare = false, className = '' }: CommandBoxProps) {
  const common = getLabels(locale).labels.common
  return (
    <div dir="ltr" className={`flex min-w-0 items-center rounded-control font-mono ${BOX[size]} ${bare ? '' : EDGE[size]} ${className}`}>
      {prompt ? <span aria-hidden="true" className="text-muted">$</span> : null}
      <code translate="no" className="min-w-0 flex-1 truncate text-start text-body">{code}</code>
      <CopyButton code={code} label={`${common.copy} ${code}`} copied={common.copied} failed={common.copyFailed} className={COPY[size]} iconSize={COPY_ICON[size]} />
    </div>
  )
}
