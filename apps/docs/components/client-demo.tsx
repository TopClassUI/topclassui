'use client'

// A demo with a client part: server HTML first, its chunk and hydration once it nears the viewport (S8).
import type { ComponentType } from 'react'

import { CLIENT_DEMO_GROUPS } from '../.generated/client-demos'
import { LazyIsland } from './lazy-island'

type Props = Record<string, unknown>

const loaderOf = (demoKey: string) => async (): Promise<ComponentType<Props>> => {
  const [slug = '', name = ''] = demoKey.split('/')
  const { DEMOS } = await CLIENT_DEMO_GROUPS[slug as keyof typeof CLIENT_DEMO_GROUPS]()
  return ((await (DEMOS as Record<string, () => Promise<unknown>>)[name]?.()) as { default: ComponentType<Props> }).default
}

export function ClientDemo({ demoKey, props = {} }: { demoKey: string; props?: Props }) {
  return <LazyIsland load={loaderOf(demoKey)} props={props} />
}
