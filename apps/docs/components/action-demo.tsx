// The demos that define an inline Server Action beside a client part: rendered on the server from their own map, which only their page's own route imports.
import type { ComponentType, ReactNode } from 'react'

import { ACTION_DEMOS } from '../.generated/action-demos'
import { ACTION_DEMO_KEYS } from '../.generated/server-demos'

async function ActionDemo({ demoKey }: { demoKey: string }) {
  const { default: Component } = (await ACTION_DEMOS[demoKey as keyof typeof ACTION_DEMOS]()) as { default: ComponentType }
  return <Component />
}

/** One component's action demos by name, for ComponentPage's `actions`. */
export function actionDemosOf(slug: string): Record<string, ReactNode> {
  const keys = ACTION_DEMO_KEYS.filter((key) => key.startsWith(`${slug}/`))
  return Object.fromEntries(keys.map((key) => [key.slice(slug.length + 1), <ActionDemo key={key} demoKey={key} />]))
}
