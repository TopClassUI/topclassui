// The folder contract of PLAN 8.1 as templates, so component 3 to 46 start correct
// rather than copied and edited. Kept out of the script so the tests can drive it.

export interface Scaffold { slug: string; name: string; screaming: string }

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** `icon-button` to `IconButton`, which is the component and the type prefix. */
export function pascalCase(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

/** `icon-button` to `ICON_BUTTON`, the prefix R-5.12-4 wants on a constant. */
export function screamingCase(slug: string): string {
  return slug.split('-').join('_').toUpperCase()
}

export function readSlug(slug: string): Scaffold {
  if (!KEBAB.test(slug)) {
    throw new Error(`"${slug}" is not kebab-case; folders and files are kebab-case (R-5.12-4)`)
  }
  return { slug, name: pascalCase(slug), screaming: screamingCase(slug) }
}

const constants = ({ screaming }: Scaffold) => `// R-8.3-2: the value lists and defaults, imported by the schema, by cva and by the component.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const ${screaming}_VARIANTS = ['solid', 'soft'] as const

export const ${screaming}_TONES = TONES

export const ${screaming}_SIZES = SIZES

export const ${screaming}_DEFAULTS = {
  variant: 'solid',
  tone: DEFAULT_TONE,
  size: DEFAULT_SIZE,
} as const
`

const schema = ({ slug, screaming }: Scaffold) => `// R-8.3-1: zod lives here only, and components import this file with \`import type\`.
import { z } from 'zod'

import { SIZES } from '#shared/contracts/size.js'
import { TONES } from '#shared/contracts/tone.js'
import { ${screaming}_DEFAULTS, ${screaming}_VARIANTS } from './constants.js'

export const ${slug.split('-').map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join('')}Schema = z.object({
  variant: z.enum(${screaming}_VARIANTS).default(${screaming}_DEFAULTS.variant),
  tone: z.enum(TONES).default(${screaming}_DEFAULTS.tone),
  size: z.enum(SIZES).default(${screaming}_DEFAULTS.size),
})
`

const types = ({ name, screaming }: Scaffold) => `import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'
import type { ${screaming}_VARIANTS } from './constants.js'

export type ${name}Variant = (typeof ${screaming}_VARIANTS)[number]

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type ${name}Tone = Tone

export interface ${name}DesignProps {
  variant?: ${name}Variant | undefined
  tone?: ${name}Tone | undefined
  size?: Size | undefined
}

export interface ${name}Props
  extends Omit<ComponentPropsWithRef<'div'>, 'children'>, ${name}DesignProps {
  children?: ReactNode | undefined
}
`

const variants = ({ slug, screaming }: Scaffold) => `import { cva } from 'class-variance-authority'

import { CONTROL_SIZE, FOCUS_RING, TRANSITION } from '#shared/classes.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { ${screaming}_DEFAULTS, ${screaming}_TONES } from './constants.js'

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
const ON_SOLID = {
  primary: 'bg-primary-solid text-primary-on-solid',
  neutral: 'bg-neutral-solid text-neutral-on-solid',
  success: 'bg-success-solid text-success-on-solid',
  warning: 'bg-warning-solid text-warning-on-solid',
  danger: 'bg-danger-solid text-danger-on-solid',
  info: 'bg-info-solid text-info-on-solid',
} as const

const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft',
  neutral: 'bg-neutral-soft text-neutral-on-soft',
  success: 'bg-success-soft text-success-on-soft',
  warning: 'bg-warning-soft text-warning-on-soft',
  danger: 'bg-danger-soft text-danger-on-soft',
  info: 'bg-info-soft text-info-on-soft',
} as const

export const ${slug.split('-').map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join('')}Variants = cva(
  ['inline-flex items-center justify-center rounded-control', FOCUS_RING, TRANSITION],
  {
    variants: {
      variant: { solid: '', soft: '' },
      tone: TONE_CLASS,
      size: CONTROL_SIZE,
    },
    compoundVariants: [
      ...${screaming}_TONES.map((tone) => ({ variant: 'solid' as const, tone, class: ON_SOLID[tone] })),
      ...${screaming}_TONES.map((tone) => ({ variant: 'soft' as const, tone, class: ON_SOFT[tone] })),
    ],
    defaultVariants: {
      variant: ${screaming}_DEFAULTS.variant,
      tone: ${screaming}_DEFAULTS.tone,
      size: ${screaming}_DEFAULTS.size,
    },
  },
)
`

const camel = (slug: string) =>
  slug.split('-').map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join('')

const index = (s: Scaffold) => `// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { ${s.screaming}_DEFAULTS } from './constants.js'
import type { ${s.name}Props } from './types.js'
import { ${camel(s.slug)}Variants } from './variants.js'

export function ${s.name}({
  variant = ${s.screaming}_DEFAULTS.variant,
  tone = ${s.screaming}_DEFAULTS.tone,
  size = ${s.screaming}_DEFAULTS.size,
  className,
  children,
  ...rest
}: ${s.name}Props) {
  return (
    <div
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(${camel(s.slug)}Variants({ variant, tone, size }), className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export { ${camel(s.slug)}Variants } from './variants.js'
export type { ${s.name}DesignProps, ${s.name}Props, ${s.name}Tone, ${s.name}Variant } from './types.js'
`

const meta = ({ name }: Scaffold) => `/** Feeds the docs navigation and the registry.json generated after v0.1. */
export const meta = {
  name: '${name}',
  category: 'TODO',
  tier: 1,
  status: 'draft',
  rendering: 'server',
  basePrimitive: null,
  optionalDeps: [],
  verifiedBaseUi: null,
} as const
`

const test = (s: Scaffold) => `import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ${s.screaming}_DEFAULTS, ${s.screaming}_SIZES, ${s.screaming}_TONES, ${s.screaming}_VARIANTS } from '../constants.js'
import { ${s.name} } from '../index.js'

const html = () => renderToStaticMarkup(<${s.name}>Hello</${s.name}>)

/** Anchored, or \`id="x"\` also matches inside \`data-testid="x"\`. */
const attr = (markup: string, name: string) =>
  new RegExp(\`(?:^|[ ])\${name}="([^"]*)"\`).exec(markup)?.[1]

describe('${s.name}', () => {
  it('renders its children', () => {
    expect(html()).toContain('Hello')
  })

  it('reports the defaults, so the docs and the tests read one source', () => {
    expect(attr(html(), 'data-variant')).toBe(${s.screaming}_DEFAULTS.variant)
    expect(attr(html(), 'data-tone')).toBe(${s.screaming}_DEFAULTS.tone)
    expect(attr(html(), 'data-size')).toBe(${s.screaming}_DEFAULTS.size)
  })

  it('offers the shared tone and size vocabularies', () => {
    expect(${s.screaming}_TONES).toHaveLength(6)
    expect(${s.screaming}_SIZES).toContain('custom')
    expect(${s.screaming}_VARIANTS.length).toBeGreaterThan(0)
  })

  it('names no palette colour in any variant and tone combination', () => {
    // TODO: widen this to every combination once the variants are real.
    expect(attr(html(), 'class')).not.toMatch(/-(violet|red|neutral)-\\d/)
  })
})
`

const dummy = (s: Scaffold) => `import { ${s.name} } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <${s.name}>Default</${s.name}>
      <${s.name} variant="soft" tone="danger">Soft danger</${s.name}>
    </div>
  )
}
`

/** Every file the scaffold writes, as a path relative to the component folder. */
export function files(scaffold: Scaffold): Map<string, string> {
  return new Map([
    ['constants.ts', constants(scaffold)],
    ['schema.ts', schema(scaffold)],
    ['types.ts', types(scaffold)],
    ['variants.ts', variants(scaffold)],
    ['index.tsx', index(scaffold)],
    ['meta.ts', meta(scaffold)],
    [`test/${scaffold.slug}.test.tsx`, test(scaffold)],
    ['dummy/basic.tsx', dummy(scaffold)],
  ])
}
