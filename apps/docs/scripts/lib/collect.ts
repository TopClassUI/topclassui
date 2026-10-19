// One pass over every component folder: what components.json, demos.ts and dates.json hold.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { openTypeProgram } from '../../../../packages/topclassui/scripts/lib/readme-types.js'
import { SECTIONS } from '../../content/sections.js'
import { type ExportsMap, namesBareRoot, rewriteImports } from '../../lib/rewrite-imports.js'
import { type ComponentContent, contentProblems, loadContent } from './content.js'
import { controlsOf } from './controls.js'
import { lastCommitDate } from './dates.js'
import { keyOf } from './demo-map.js'
import { COMPONENTS, LIBRARY, componentFolders, demoNamesOf, metaOf } from './library.js'
import { jsonSchemaOf, propsOf } from './props.js'
import type { ComponentEntry, ComponentsFile } from './shape.js'

export interface Issue {
  slug: string
  kind: 'content-missing' | 'content-invalid' | 'bare-root' | 'unresolved-import' | 'size-missing'
  detail: string
}

export interface Collected {
  file: ComponentsFile
  dates: Record<string, string | null>
  issues: Issue[]
}

/** The own client bytes pnpm size wrote for each folder with a client.js; a server folder has none. */
export function clientBytesOf(libraryRoot: string): Record<string, number> {
  const file = join(libraryRoot, 'size.json')
  if (!existsSync(file)) return {}
  const { components } = JSON.parse(readFileSync(file, 'utf8')) as { components: Record<string, { clientBytes: number }> }
  return Object.fromEntries(Object.entries(components).map(([slug, size]) => [slug, size.clientBytes]))
}

const placeOf = (slug: string) => {
  for (const section of SECTIONS) {
    const order = (section.slugs as readonly string[]).indexOf(slug)
    if (order !== -1) return { section: section.id, order, card: true, page: true }
    if ((section.pages as readonly string[]).includes(slug)) return { section: section.id, order: null, card: false, page: true }
  }
  return { section: null, order: null, card: false, page: false }
}

/** Reads every folder under the library's src/components; contentDir is the site's content/components. */
export async function collect(contentDir: string, exportsMap: ExportsMap, repoRoot: string): Promise<Collected> {
  const folders = componentFolders()
  const files = folders.flatMap((slug) => ['types.ts', 'index.tsx'].map((f) => join(COMPONENTS, slug, f))).filter((f) => existsSync(f))
  const program = openTypeProgram(LIBRARY, files)
  const pages = new Set(folders.filter((slug) => placeOf(slug).page))
  const issues: Issue[] = []
  const components: ComponentEntry[] = []
  const dates: Record<string, string | null> = {}
  const sizes = clientBytesOf(LIBRARY)

  for (const slug of folders) {
    const dir = join(COMPONENTS, slug)
    const meta = await metaOf(dir)
    const json = await jsonSchemaOf(dir)
    const demoNames = demoNamesOf(dir)
    const place = placeOf(slug)
    const clientBytes = meta.rendering === 'server' ? null : (sizes[slug] ?? null)
    if (meta.rendering !== 'server' && clientBytes === null) issues.push({ slug, kind: 'size-missing', detail: 'size.json has no number for it: run pnpm build && pnpm size' })

    let content: ComponentContent | null = null
    if (place.page) {
      const raw = await loadContent(contentDir, slug)
      if (raw === null) issues.push({ slug, kind: 'content-missing', detail: `content/components/${slug}.ts does not exist yet` })
      else {
        const problems = contentProblems(raw, { slug, demos: demoNames, pages, hasSchema: json !== null })
        for (const detail of problems) issues.push({ slug, kind: 'content-invalid', detail })
        if (problems.length === 0) content = raw as ComponentContent
      }
    }

    const demos = demoNames.map((name) => {
      const source = readFileSync(join(dir, 'dummy', `${name}.tsx`), 'utf8')
      const { code, unresolved } = rewriteImports(source, slug, exportsMap)
      for (const specifier of unresolved) issues.push({ slug, kind: 'unresolved-import', detail: `dummy/${name}.tsx: ${specifier}` })
      if (namesBareRoot(code)) issues.push({ slug, kind: 'bare-root', detail: `dummy/${name}.tsx shows 'topclassui' with no subpath` })
      return { name, key: keyOf({ slug, name }), source: code }
    })

    components.push({
      slug,
      name: meta.name,
      rendering: meta.rendering,
      status: meta.status,
      tier: meta.tier,
      category: meta.category,
      baseUi: meta.baseUi,
      clientBytes,
      ...place,
      files: {
        client: existsSync(join(dir, 'client.tsx')),
        schema: json !== null,
        playground: demoNames.includes('playground'),
        states: demoNames.includes('states'),
      },
      content,
      props: propsOf(program, dir, meta, json),
      controls: json ? controlsOf(json) : [],
      demos,
    })
    dates[slug] = lastCommitDate([dir, join(contentDir, `${slug}.ts`)], repoRoot)
  }

  const sections = SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    lead: section.lead,
    slugs: [...section.slugs],
    pages: [...section.pages],
    count: section.slugs.length,
  }))
  return { file: { sections, components }, dates, issues }
}
