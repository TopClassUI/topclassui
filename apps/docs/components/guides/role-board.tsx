import type { ReactNode } from 'react'
import { Button } from 'topclassui/button'
import { CardBody, CardHeader, CardRoot } from 'topclassui/card'
import { BORDER } from 'topclassui/classes'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'

/** Class names, the same in every language: what the board labels each part with. */
const ROLE = {
  bgPage: 'bg-page',
  bgSurface: 'bg-surface',
  textBody: 'text-body',
  textMuted: 'text-muted',
  bgPrimarySolid: 'bg-primary-solid',
  borderLine: 'border-line',
  bgPrimarySoft: 'bg-primary-soft',
  bgSurfaceRaised: 'bg-surface-raised',
} as const

const CHIP = 'inline-flex w-fit rounded-chip bg-neutral-soft px-1.5 font-mono text-xs text-body'

function Chip({ children }: { children: string }) {
  return <code dir="ltr" className={CHIP}>{children}</code>
}

/** One screen built from real components, each part carrying the class that paints it, beside the page's list of roles (docs-site page 7). */
export function RoleBoard({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const labels = guideLabelsFor(locale).board
  const [selected, ...rest] = labels.options
  return (
    <figure className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <figcaption className="text-sm text-muted lg:col-span-2">{labels.label}</figcaption>
      <div inert className={`flex flex-col gap-3 rounded-box bg-page p-3 ${BORDER}`}>
        <Chip>{ROLE.bgPage}</Chip>
        <div className="flex items-center justify-between gap-2 rounded-control border-b-(length:--tc-line-width) border-line bg-surface p-2">
          <span className="text-sm font-semibold text-body">{labels.brand}</span>
          <Chip>{ROLE.bgSurface}</Chip>
        </div>
        <CardRoot>
          <CardHeader>
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-body">{labels.title}</span>
              <Chip>{ROLE.textBody}</Chip>
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">{labels.lead}</span>
              <Chip>{ROLE.textMuted}</Chip>
            </span>
          </CardHeader>
          <CardBody>
            <span className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm">{labels.save}</Button>
              <Chip>{ROLE.bgPrimarySolid}</Chip>
              <Chip>{ROLE.borderLine}</Chip>
            </span>
          </CardBody>
        </CardRoot>
        <div className={`flex flex-col gap-1 rounded-box bg-surface-raised p-1 ${BORDER}`}>
          <span className="flex items-center justify-between gap-2 rounded-control bg-primary-soft px-2 py-1 text-sm text-primary-on-soft">
            {selected}
            <Chip>{ROLE.bgPrimarySoft}</Chip>
          </span>
          {rest.map((option) => <span key={option} className="px-2 py-1 text-sm text-body">{option}</span>)}
          <Chip>{ROLE.bgSurfaceRaised}</Chip>
        </div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </figure>
  )
}
