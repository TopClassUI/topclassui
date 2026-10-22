'use client'

// One example's stage (page 14): the island that hydrates the demo it holds, so its client parts come alive near the viewport.
import type { ReactNode } from 'react'

/** A box with geometry of its own: the island watches its first element, and a demo's own island box has none. */
export function ExampleStage({ stage }: { stage: ReactNode }) {
  return <div className="grid w-full min-w-0 grid-cols-1 place-items-center *:max-w-full">{stage}</div>
}
