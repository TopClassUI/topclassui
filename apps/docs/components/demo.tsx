// One demo from the workspace's dist, through the generated map of literal imports (S7, choice 7).
import type { ComponentType } from 'react'

import { DEMOS } from '../.generated/demos'

type Loaded = { default: ComponentType<Record<string, unknown>> }

export function isDemoKey(key: string): key is keyof typeof DEMOS {
  return key in DEMOS
}

/** Renders on the server; a demo whose file says 'use client' arrives as a client reference and hydrates. */
export async function Demo({ demoKey, props = {} }: { demoKey: string; props?: Record<string, unknown> }) {
  if (!isDemoKey(demoKey)) return null
  const { default: Component } = (await DEMOS[demoKey]()) as Loaded
  return <Component {...props} />
}
