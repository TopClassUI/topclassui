// .generated/demos.ts: one literal import per demo into the workspace's dist, never a resolve alias (choice 7).
export interface DemoKey {
  slug: string
  name: string
}

/** From apps/docs/.generated to the repository root. */
export const TO_ROOT = '../../..'

export const keyOf = (demo: DemoKey): string => `${demo.slug}/${demo.name}`

export const distFileOf = (demo: DemoKey): string =>
  `packages/topclassui/dist/components/${demo.slug}/dummy/${demo.name}.js`

/** The source of demos.ts: the loader map and the list of keys, in the order given. */
export function demoMapSource(demos: DemoKey[]): string {
  const lines = demos.map((demo) => `  '${keyOf(demo)}': () => import('${TO_ROOT}/${distFileOf(demo)}'),`)
  const keys = demos.map((demo) => `  '${keyOf(demo)}',`)
  return [
    '// Written by pnpm docs:data. Do not edit.',
    'export const DEMOS = {',
    ...lines,
    '} as const',
    '',
    'export const DEMO_KEYS = [',
    ...keys,
    '] as const',
    '',
    'export type DemoKey = (typeof DEMO_KEYS)[number]',
    '',
  ].join('\n')
}

/** The keys and files a demos.ts lists, read back for the shape check. */
export function parseDemoMap(source: string): { key: string; file: string }[] {
  return [...source.matchAll(/^ {2}'([^']+)': \(\) => import\('([^']+)'\),$/gm)]
    .map((match) => ({ key: match[1] ?? '', file: match[2] ?? '' }))
}
