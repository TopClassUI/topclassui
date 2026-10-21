// An Input with a muted icon at its inline start and, given one, a key hint at its end, as Home's frames draw their fields.
import type { ReactNode } from 'react'
import { Icon } from 'topclassui/icon'
import type { IconName } from 'topclassui/icons'

const START = 'pointer-events-none absolute inset-y-0 inset-s-2.5 flex items-center text-muted'
const END = 'pointer-events-none absolute inset-y-0 inset-e-1.5 flex items-center'

/** The room the Input leaves for the icon, and for the hint: the caller adds these to its className. */
export const ROOM = { start: 'ps-8', end: 'pe-9' } as const

export interface AdornedInputProps {
  icon: IconName
  /** A key hint drawn at the inline end, such as a Kbd; decorative, as the Input carries the name. */
  end?: ReactNode
  /** ltr for a field the library keeps left to right (email, url, tel, number), so the icon sits at the value's own start. */
  dir?: 'ltr'
  className?: string
  children: ReactNode
}

export function AdornedInput({ icon, end, dir, className = '', children }: AdornedInputProps) {
  return (
    <div dir={dir} className={`relative min-w-0 ${className}`}>
      <span aria-hidden="true" className={START}><Icon name={icon} size="0.875rem" /></span>
      {children}
      {end === undefined ? null : <span aria-hidden="true" className={END}>{end}</span>}
    </div>
  )
}
