import type { ReactNode } from 'react'
import { CardBody, CardHeader, CardRoot } from 'topclassui/card'

/** Two to four cards a row, one a row under 48rem: `<Cards>` with `<Card title>` children. */
export function Cards({ children }: { children?: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}

export function Card({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <CardRoot>
      <CardHeader>
        <h3 className="text-lg font-semibold text-body">{title}</h3>
      </CardHeader>
      <CardBody>
        <div className="text-sm text-muted">{children}</div>
      </CardBody>
    </CardRoot>
  )
}
