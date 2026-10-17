// The facts the foundation pages print, from .generated/ only (docs-site S7: the one door).
import changelog from '../.generated/changelog.json' with { type: 'json' }
import components from '../.generated/components.json' with { type: 'json' }
import guides from '../.generated/guides.json' with { type: 'json' }
import type { Rendering } from '../labels/index'
import type { ChangelogFacts, GuideFacts, TokenFact } from './guide-facts'

export const GUIDES = guides as GuideFacts

export const CHANGELOG = changelog as ChangelogFacts

/** How many of the package's component imports are of each kind, read from each meta.ts. */
export const KIND_COUNTS: Record<Rendering, number> & { total: number } = (() => {
  const kinds = (components.components as readonly { rendering: Rendering }[]).map((entry) => entry.rendering)
  const count = (kind: Rendering) => kinds.filter((value) => value === kind).length
  return { server: count('server'), split: count('split'), client: count('client'), total: kinds.length }
})()

/** `--tc-page`, or a tone role written `primary/solid`, as the token it names; null for anything else. */
export function tokenNameOf(text: string): string | null {
  const variable = /--tc-[a-z-]+/.exec(text)?.[0]
  if (variable !== undefined) return variable
  const role = /^([a-z]+)\/([a-z-]+)$/.exec(text.trim())
  return role === null ? null : `--tc-${role[1] ?? ''}-${role[2] ?? ''}`
}

export function tokenFact(name: string): TokenFact {
  const fact = GUIDES.tokens[name]
  if (fact === undefined) throw new Error(`${name} is not a colour token docs:data measured`)
  return fact
}

export function knobDefault(name: string): string {
  const value = GUIDES.knobs[name]
  if (value === undefined) throw new Error(`tokens.css declares no ${name} on :root`)
  return value
}
