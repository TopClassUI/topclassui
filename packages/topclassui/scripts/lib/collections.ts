// R-8.5-1: which component folders render items, and whether their hook windows them through useCollection.

/** The folders that render items without useCollection, each by a decision in docs/DECISIONS.md. Keep it short. */
export const COLLECTION_EXEMPT: Readonly<Record<string, string>> = {
  breadcrumb: 'not a collection in PLAN 8.5 (1371) or 18 (2062); every crumb must be HTML (1800, 1809)',
  dropdown: "a deviation from PLAN 8.5 (1399): Base UI's Menu moves real focus over mounted items only (MenuRoot.js:368-382)",
  stepper: 'not a collection in PLAN 8.5 (1371) or 18 (2061), which lists a handful of steps',
  timeline: 'PLAN 18 (1986): "Collection (8.5) when it grows"; it renders the items it is given until then',
}

/** The source with its comments blanked, so a word in a comment never counts as code. */
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** The code with its import statements blanked, so naming a type is not taking it. */
const withoutImports = (code: string) => code.replace(/^\s*import\s[\s\S]*?\sfrom\s*['"][^'"]*['"]/gm, ' ')

/** The props take the shared contract, whole or picked. */
export function takesCollectionProps(types: string): boolean {
  return /\bCollectionProps\b/.test(withoutImports(stripComments(types)))
}

/** The props take a list to render: an `items` prop, the shared contract, or the menu contract that carries items. */
export function rendersItems(types: string): boolean {
  const code = withoutImports(stripComments(types))
  return /^\s*(readonly\s+)?items\??\s*:/m.test(code) || takesCollectionProps(code) || /\bMenuContract\b/.test(code)
}

/** The props take a `loadMore`, so a page-by-page demo has to prove it is called. */
export function takesLoadMore(types: string): boolean {
  const code = withoutImports(stripComments(types))
  const whole = code.replace(/\bPick<\s*CollectionProps<[^>]*>[^>]*>/g, ' ')
  return /^\s*loadMore\??\s*:/m.test(code) || /\bCollectionProps\b/.test(whole)
    || /\bPick<\s*CollectionProps<[^>]*>[^>]*['"]loadMore['"]/.test(code)
}

/** A list by its knob: the props take visibleRows, or the code reads --tc-list-rows, whatever the items are called. */
export function takesListRows(code: string): boolean {
  const live = stripComments(code)
  return /^\s*(readonly\s+)?visibleRows\??\s*:/m.test(live) || /--tc-list-rows\b/.test(live)
}

/** The hook imports useCollection from the shared module and calls it. */
export function callsUseCollection(hook: string): boolean {
  const code = stripComments(hook)
  return /import\s*\{[^}]*\buseCollection\b[^}]*\}\s*from\s*['"][^'"]*shared\/collection\/use-collection\.js['"]/.test(code)
    && /\buseCollection\s*(<[^>]*>)?\s*\(/.test(code)
}

export interface CollectionFolder {
  slug: string
  /** types.ts, or null when the folder has none. */
  types: string | null
  /** hook.ts, or null when the folder has none. */
  hook: string | null
  /** schema.ts, classes.ts and client.tsx together, where a list names its knob; empty when there are none. */
  rest?: string | undefined
}

/** Every way a folder breaks R-8.5-1, or an exemption that no longer holds. */
export function collectionErrors({ slug, types, hook, rest = '' }: CollectionFolder, exempt = COLLECTION_EXEMPT): string[] {
  const uses = hook !== null && callsUseCollection(hook)
  const renders = (types !== null && rendersItems(types)) || takesListRows(`${types ?? ''}\n${rest}`)
  const reason = exempt[slug]
  if (reason !== undefined) {
    if (types !== null && takesCollectionProps(types)) return ['its props take CollectionProps, which no exemption covers']
    if (uses) return ['calls useCollection and is still exempt; remove it from COLLECTION_EXEMPT']
    if (!renders) return ['renders no items and is still exempt; remove it from COLLECTION_EXEMPT']
    return []
  }
  if (!renders || uses) return []
  if (hook === null) return ['renders items and has no hook.ts to call useCollection in']
  return ['renders items and its hook.ts never calls useCollection']
}
