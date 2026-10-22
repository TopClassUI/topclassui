import type { ReactNode } from 'react'
import { CardBody, CardHeader, CardRoot } from 'topclassui/card'

const COLUMNS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' } as const

/** Two or three cards a row, as the page's frame draws them, one a row under 48rem: `<Cards>` with `<Card title>` children. */
export function Cards({ children, columns = 2 }: { children?: ReactNode; columns?: keyof typeof COLUMNS }) {
  return <div className={`grid grid-cols-1 gap-3.5 ${COLUMNS[columns]}`}>{children}</div>
}

export function Card({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <CardRoot className="gap-1.5 bg-surface p-4">
      <CardHeader>
        <h3 className="text-sm font-semibold text-body">{title}</h3>
      </CardHeader>
      <CardBody>
        <div className="text-xs text-muted **:text-[length:inherit]">{children}</div>
      </CardBody>
    </CardRoot>
  )
}
