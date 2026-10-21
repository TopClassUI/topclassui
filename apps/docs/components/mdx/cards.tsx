import type { ReactNode } from 'react'
import { CardBody, CardHeader, CardRoot } from 'topclassui/card'

const COLUMNS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' } as const

/** Two or three cards a row, one a row under 48rem: `<Cards>` with `<Card title>` children. */
export function Cards({ columns = 2, children }: { columns?: keyof typeof COLUMNS; children?: ReactNode }) {
  return <div className={`grid grid-cols-1 gap-3 ${COLUMNS[columns]}`}>{children}</div>
}

export function Card({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <CardRoot className="gap-1 bg-surface p-3.5">
      <CardHeader>
        <h3 className="text-sm font-semibold text-body">{title}</h3>
      </CardHeader>
      <CardBody>
        {/* A narrow card would break a flag such as --no-install at its hyphen, worst inside Arabic text. */}
        <div className="text-xs text-muted **:whitespace-nowrap">{children}</div>
      </CardBody>
    </CardRoot>
  )
}
