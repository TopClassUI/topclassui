'use client'

// The Every state strip of a states demo with a client part: the demo's chunk loads near the viewport, and its returned tree is split into cells.
import type { ComponentType } from 'react'

import { loaderOf } from '../client-demo'
import { LazyIsland } from '../lazy-island'
import { StateStrip, type StateStripProps } from './state-strip'

type StripProps = Omit<StateStripProps, 'tree'>

const strips = new Map<string, () => Promise<ComponentType<StripProps>>>()

/** One loader per key, kept, so the island's effect sees the same function on every render. */
function stripOf(demoKey: string): () => Promise<ComponentType<StripProps>> {
  const known = strips.get(demoKey)
  if (known !== undefined) return known
  const load = async (): Promise<ComponentType<StripProps>> => {
    const Demo = (await loaderOf(demoKey)()) as (props: Record<string, never>) => StateStripProps['tree']
    // The demo is called, not mounted, so its root's children can be laid out one per cell; its hooks run in this render.
    return function Strip(props: StripProps) {
      return <StateStrip tree={Demo({})} {...props} />
    }
  }
  strips.set(demoKey, load)
  return load
}

export function ClientStates({ demoKey, ...props }: StripProps & { demoKey: string }) {
  return <LazyIsland load={stripOf(demoKey)} props={props} />
}
