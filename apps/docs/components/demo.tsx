// One demo from the workspace's dist, through the generated maps of literal imports (S7, choice 7).
import type { ComponentType } from 'react'

import { ACTION_DEMO_KEYS, CLIENT_DEMO_KEYS, SERVER_DEMOS } from '../.generated/server-demos'
import { ClientDemo } from './client-demo'

type Loaded = { default: ComponentType<Record<string, unknown>> }

export function isDemoKey(key: string): boolean {
  return key in SERVER_DEMOS || CLIENT_DEMO_KEYS.includes(key) || ACTION_DEMO_KEYS.includes(key)
}

/** A server demo renders here and ships no script; one with a client part goes to its island, so a page's bundle holds no other demo. An action demo renders through ExampleDemo. */
export async function Demo({ demoKey, props = {} }: { demoKey: string; props?: Record<string, unknown> }) {
  if (CLIENT_DEMO_KEYS.includes(demoKey)) return <ClientDemo demoKey={demoKey} props={props} />
  if (!(demoKey in SERVER_DEMOS)) return null
  const { default: Component } = (await SERVER_DEMOS[demoKey as keyof typeof SERVER_DEMOS]()) as Loaded
  return <Component {...props} />
}
