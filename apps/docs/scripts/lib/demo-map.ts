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

const loaders = (demos: DemoKey[]) => demos.map((demo) => `  '${keyOf(demo)}': () => import('${TO_ROOT}/${distFileOf(demo)}'),`)
const keyList = (demos: DemoKey[]) => demos.map((demo) => `  '${keyOf(demo)}',`)

/** server-demos.ts: the demos that reach no 'use client' file, and only the keys of the others, so a page's server graph holds no client demo. */
export function serverDemoMapSource(server: DemoKey[], client: DemoKey[], action: DemoKey[]): string {
  return [
    '// Written by pnpm docs:data. Do not edit.',
    'export const SERVER_DEMOS = {',
    ...loaders(server),
    '} as const',
    '',
    'export const CLIENT_DEMO_KEYS: readonly string[] = [',
    ...keyList(client),
    ']',
    '',
    'export const ACTION_DEMO_KEYS: readonly string[] = [',
    ...keyList(action),
    ']',
    '',
  ].join('\n')
}

/** client-demos.ts: one loader per component, so a page's bundle carries 46 entries rather than one per demo. */
export function clientDemoMapSource(client: DemoKey[]): string {
  const slugs = [...new Set(client.map((demo) => demo.slug))]
  return [
    '// Written by pnpm docs:data. Do not edit.',
    'export const CLIENT_DEMO_GROUPS = {',
    ...slugs.map((slug) => `  '${slug}': () => import('./client-demos/${slug}'),`),
    '} as const',
    '',
  ].join('\n')
}

/** client-demos/<slug>.ts: that component's demos with a client part, each its own chunk, imported by the client island alone. */
export function clientDemoGroupSource(client: DemoKey[]): string {
  return [
    '// Written by pnpm docs:data. Do not edit.',
    'export const DEMOS = {',
    ...client.map((demo) => `  '${demo.name}': () => import('../${TO_ROOT}/${distFileOf(demo)}'),`),
    '} as const',
    '',
  ].join('\n')
}

/** action-demos.ts: the demos that define an inline Server Action beside a client part, imported by the component page alone, so no other route carries their client code. */
export function actionDemoMapSource(action: DemoKey[]): string {
  return ['// Written by pnpm docs:data. Do not edit.', 'export const ACTION_DEMOS = {', ...loaders(action), '} as const', ''].join('\n')
}

/** The keys and files a demos.ts lists, read back for the shape check. */
export function parseDemoMap(source: string): { key: string; file: string }[] {
  return [...source.matchAll(/^ {2}'([^']+)': \(\) => import\('([^']+)'\),$/gm)]
    .map((match) => ({ key: match[1] ?? '', file: match[2] ?? '' }))
}

/** The source of playgrounds.ts: only the Try it stages, the one map a client island imports, so no other demo joins its bundle. */
export function playgroundMapSource(slugs: readonly string[]): string {
  const lines = slugs.map((slug) => `  '${slug}': () => import('${TO_ROOT}/${distFileOf({ slug, name: 'playground' })}'),`)
  return [
    '// Written by pnpm docs:data. Do not edit.',
    'export const PLAYGROUNDS = {',
    ...lines,
    '} as const',
    '',
    'export type PlaygroundSlug = keyof typeof PLAYGROUNDS',
    '',
  ].join('\n')
}
