// The shape of every file docs:data writes, checked before it is written and again by the tests.
import { z } from 'zod'

import { SECTIONS } from '../../content/sections.js'
import { specifiersOf } from '../../lib/rewrite-imports.js'
import { contentSchema } from './content.js'
import { parseDemoMap } from './demo-map.js'
import { LOCALES } from './toc.js'

const both = z.strictObject({ en: z.string(), ar: z.string() })
const value = z.union([z.string(), z.number(), z.boolean()])

const rowSchema = z.object({
  name: z.string().min(1),
  required: z.boolean(),
  type: z.string(),
  default: z.string(),
  description: z.string(),
  oneOf: z.array(z.string()).optional(),
  when: z.string().optional(),
  min: z.number().nullable(),
  max: z.number().nullable(),
})

const controlSchema = z.discriminatedUnion('kind', [
  z.strictObject({ prop: z.string(), kind: z.enum(['select', 'segmented']), options: z.array(value).min(1), default: value.nullable() }),
  z.strictObject({ prop: z.string(), kind: z.literal('switch'), default: z.boolean() }),
  z.strictObject({
    prop: z.string(), kind: z.literal('slider'), min: z.number(), max: z.number(), step: z.number().nullable(), default: z.number().nullable(),
  }),
  z.strictObject({
    prop: z.string(), kind: z.literal('number'), min: z.number().nullable(), max: z.number().nullable(),
    step: z.number().nullable(), default: z.number().nullable(),
  }),
])

const sectionIds = SECTIONS.map((section) => section.id)

export const componentSchema = z.strictObject({
  slug: z.string().min(1),
  name: z.string().min(1),
  rendering: z.enum(['server', 'split', 'client']),
  status: z.enum(['draft', 'beta', 'stable']),
  tier: z.number().int().min(1).max(4),
  category: z.string().min(1),
  baseUi: z.string().nullable(),
  clientBytes: z.number().int().min(0).nullable(),
  section: z.enum(sectionIds).nullable(),
  order: z.number().int().min(0).nullable(),
  card: z.boolean(),
  page: z.boolean(),
  files: z.strictObject({ client: z.boolean(), schema: z.boolean(), playground: z.boolean(), states: z.boolean() }),
  content: contentSchema.nullable(),
  props: z.array(z.strictObject({ name: z.string().min(1), rows: z.array(rowSchema) })).min(1),
  controls: z.array(controlSchema),
  demos: z.array(z.strictObject({ name: z.string().min(1), key: z.string().min(1), source: z.string().min(1) })),
})

export const componentsFileSchema = z.strictObject({
  sections: z.array(z.strictObject({
    id: z.enum(sectionIds), title: both, lead: both, slugs: z.array(z.string()), pages: z.array(z.string()), count: z.number().int(),
  })).length(SECTIONS.length),
  components: z.array(componentSchema),
})

const tocEntries = z.record(z.string(), z.array(z.strictObject({ text: z.string().min(1), id: z.string().min(1) })))
export const tocFileSchema = z.strictObject(Object.fromEntries(LOCALES.map((locale) => [locale, tocEntries])) as Record<'en' | 'ar', typeof tocEntries>)

const isoOrNull = z.iso.datetime({ offset: true }).nullable()
export const datesFileSchema = z.strictObject({
  components: z.record(z.string(), isoOrNull),
  pages: z.record(z.string(), isoOrNull),
})

export type ComponentEntry = z.infer<typeof componentSchema>
export type ComponentsFile = z.infer<typeof componentsFileSchema>

export interface Generated {
  components: unknown
  toc: unknown
  dates: unknown
  demos: string
}

/** Everything wrong with one run's output, as sentences; empty when every file has its shape and they agree. */
export function generatedProblems(generated: Generated, demoFileExists: (key: string) => boolean): string[] {
  const problems: string[] = []
  const collect = (file: string, result: z.ZodSafeParseResult<unknown>) => {
    if (!result.success) for (const issue of result.error.issues) problems.push(`${file} ${issue.path.join('.')}: ${issue.message}`)
    return result.success
  }
  const components = componentsFileSchema.safeParse(generated.components)
  collect('components.json', components)
  collect('toc.json', tocFileSchema.safeParse(generated.toc))
  const dates = datesFileSchema.safeParse(generated.dates)
  collect('dates.json', dates)
  if (!components.success) return problems

  const { sections, components: entries } = components.data
  const slugs = entries.map((entry) => entry.slug)
  const cards = sections.flatMap((section) => section.slugs)
  if (new Set(cards).size !== cards.length) problems.push('components.json: a catalog slug is in two sections')
  for (const slug of [...cards, ...sections.flatMap((section) => section.pages)]) {
    if (!slugs.includes(slug)) problems.push(`components.json: section slug ${slug} has no component folder`)
  }
  for (const entry of entries) {
    for (const demo of entry.demos) {
      if (demo.key !== `${entry.slug}/${demo.name}`) problems.push(`components.json: ${entry.slug} demo ${demo.name} has key ${demo.key}`)
      const internal = specifiersOf(demo.source).filter((s) => s.startsWith('#') || s.startsWith('.'))
      if (internal.length > 0) problems.push(`components.json: ${demo.key} still imports ${internal.join(', ')}`)
    }
  }
  const listed = entries.flatMap((entry) => entry.demos.map((demo) => demo.key))
  const mapped = parseDemoMap(generated.demos)
  if (JSON.stringify(mapped.map((m) => m.key)) !== JSON.stringify(listed)) problems.push('demos.ts: the keys differ from components.json')
  for (const { key, file } of mapped) {
    if (!file.endsWith(`/dist/components/${key.replace('/', '/dummy/')}.js`)) problems.push(`demos.ts: ${key} imports ${file}`)
    if (!demoFileExists(key)) problems.push(`demos.ts: ${key} has no source file`)
  }
  if (dates.success && JSON.stringify(Object.keys(dates.data.components)) !== JSON.stringify(slugs)) {
    problems.push('dates.json: the components differ from components.json')
  }
  return problems
}
