// The hand-written data of one component page, content/components/<slug>.ts, and its checks (docs-site S7).
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { z } from 'zod'

const both = z.strictObject({ en: z.string().min(1), ar: z.string().min(1) })
const bothLists = z.strictObject({ en: z.array(z.string().min(1)), ar: z.array(z.string().min(1)) })

export const DESCRIPTION_MIN = 50
export const DESCRIPTION_MAX = 160

export const contentSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: both,
  description: z.strictObject({
    en: z.string().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX),
    ar: z.string().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX),
  }),
  demos: z.array(z.string().min(1)).min(1),
  stageHeight: z.number().positive(),
  stageDemo: z.string().min(1).optional(),
  /** The frame draws the overlay open in the stage: the playground demo gets `stage` and renders open inside its own root. */
  stageOpen: z.boolean().optional(),
  /** Boolean props the schema leaves to the element (a native `disabled`) that Try it still offers, as the frame draws them. */
  extraSwitches: z.array(z.string().regex(/^[a-z][A-Za-z]*$/)).optional(),
  /** Props Try it lists first, in the frame's order; the rest follow in the schema's. */
  controlOrder: z.array(z.string().regex(/^[a-z][A-Za-z]*$/)).optional(),
  note: both,
  notes: bothLists,
  keyboard: z.array(z.strictObject({ keys: z.array(z.string().min(1)).min(1), action: both })),
  accessibility: bothLists,
  rtl: both,
  related: z.strictObject({ components: z.array(z.string().min(1)), pages: z.array(z.string().min(1)) }),
})

export type ComponentContent = z.infer<typeof contentSchema>

export interface ContentContext {
  slug: string
  demos: readonly string[]
  /** Every slug with a component page, for the related links. */
  pages: ReadonlySet<string>
  /** A component with no schema has no Try it, so its stage needs a stageDemo. */
  hasSchema: boolean
}

/** Everything wrong with one content file, each as a sentence; empty when it passes. */
export function contentProblems(value: unknown, context: ContentContext): string[] {
  const parsed = contentSchema.safeParse(value)
  if (!parsed.success) return parsed.error.issues.map((issue) => `${issue.path.join('.') || '(file)'}: ${issue.message}`)
  const content = parsed.data
  const problems: string[] = []
  if (content.slug !== context.slug) problems.push(`slug is ${content.slug}, the file is ${context.slug}`)
  for (const demo of content.demos) {
    if (!context.demos.includes(demo)) problems.push(`demo ${demo} has no dummy/${demo}.tsx`)
  }
  if (new Set(content.demos).size !== content.demos.length) problems.push('a demo is listed twice')
  if (content.stageDemo !== undefined && !context.demos.includes(content.stageDemo)) {
    problems.push(`stageDemo ${content.stageDemo} has no dummy/${content.stageDemo}.tsx`)
  }
  if (!context.hasSchema && content.stageDemo === undefined) problems.push('no schema, so the stage needs a stageDemo')
  for (const related of content.related.components) {
    if (!context.pages.has(related)) problems.push(`related component ${related} has no page`)
  }
  for (const list of ['notes', 'accessibility'] as const) {
    if (content[list].en.length !== content[list].ar.length) problems.push(`${list} has a different count in en and ar`)
  }
  return problems
}

/** The object a content file exports, or null when the file does not exist yet. */
export async function loadContent(dir: string, slug: string): Promise<unknown> {
  const file = join(dir, `${slug}.ts`)
  if (!existsSync(file)) return null
  const loaded = (await import(pathToFileURL(file).href)) as Record<string, unknown>
  const values = Object.values(loaded)
  return values.find((v) => typeof v === 'object' && v !== null && (v as { slug?: unknown }).slug === slug) ?? values[0] ?? null
}
