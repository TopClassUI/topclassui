// One shape for all 46 meta.ts files, so the docs navigation and registry.json cannot drift.

/** One per catalog section of PLAN 18; 18.8's SEO kit groups under providers. */
export const CATEGORIES = [
  'typography-and-layout',
  'media-and-display',
  'actions',
  'forms',
  'overlays',
  'navigation-and-disclosure',
  'data',
  'providers-and-utilities',
  'connectors',
  'editor-kit',
] as const
export type Category = (typeof CATEGORIES)[number]

/** How much of the component reaches the browser, which the 0 KB claim is measured against. */
export const RENDERINGS = ['server', 'split', 'client'] as const
export type Rendering = (typeof RENDERINGS)[number]

/** `stable` is only true once every line of PLAN 20 is, so a component starts below it. */
export const STATUSES = ['draft', 'beta', 'stable'] as const
export type Status = (typeof STATUSES)[number]

export const TIERS = [1, 2, 3, 4] as const
export type Tier = (typeof TIERS)[number]

export interface ComponentMeta {
  name: string
  /** The folder name, which is also the docs route and the registry key. */
  slug: string
  category: Category
  tier: Tier
  status: Status
  rendering: Rendering
  /** The Base UI part this is built on, null when it uses none. */
  baseUi: string | null
  /** R-20-1: the Base UI range the component was verified against. */
  baseUiRange: string | null
  optionalDeps: readonly string[]
}
