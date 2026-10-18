'use client'

// A demo with a client part: server HTML first, then its chunk and a fresh render in its place once it nears the viewport (S8).
import type { ComponentType } from 'react'

import { CLIENT_DEMO_GROUPS } from '../.generated/client-demos'
import { LazyIsland } from './lazy-island'

type Props = Record<string, unknown>

const loaders = new Map<string, () => Promise<ComponentType<Props>>>()

/** One loader per key, kept, so the island's effect sees the same function on every render. */
function loaderOf(demoKey: string): () => Promise<ComponentType<Props>> {
  const known = loaders.get(demoKey)
  if (known !== undefined) return known
  const load = async (): Promise<ComponentType<Props>> => {
    const [slug = '', name = ''] = demoKey.split('/')
    const { DEMOS } = await CLIENT_DEMO_GROUPS[slug as keyof typeof CLIENT_DEMO_GROUPS]()
    return ((await (DEMOS as Record<string, () => Promise<unknown>>)[name]?.()) as { default: ComponentType<Props> }).default
  }
  loaders.set(demoKey, load)
  return load
}

export function ClientDemo({ demoKey, props = {} }: { demoKey: string; props?: Props }) {
  return <LazyIsland load={loaderOf(demoKey)} props={props} />
}
