'use client'

import { lazy, Suspense, useState } from 'react'
import { Button } from 'topclassui/button'

const VoidDialog = lazy(() => import('./void-dialog'))

export interface VoidIslandProps {
  label: string
  title: string
  body: string
  keep: string
}

/** The Void button and its Dialog: the dialog's code arrives on the first press, not with the page. */
export function VoidIsland({ label, title, body, keep }: VoidIslandProps) {
  const [open, setOpen] = useState(false)
  const [wanted, setWanted] = useState(false)
  return (
    <>
      <Button size="xs" tone="danger" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setWanted(true); setOpen(true) }}>
        {label}
      </Button>
      {wanted ? (
        <Suspense fallback={null}>
          <VoidDialog open={open} onOpenChange={setOpen} title={<bdi>{title}</bdi>} body={body} keep={keep} />
        </Suspense>
      ) : null}
    </>
  )
}
