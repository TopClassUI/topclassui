// The rules of docs/RULES.md that a linter can enforce. Rule ids are in the messages.
import type { ESLint } from 'eslint'

type Node = any
type Context = any

/** A string literal only matters when it can become a class name. */
function inClassContext(node: Node): boolean {
  let n = node.parent
  let depth = 0
  while (n && depth++ < 12) {
    if (n.type === 'JSXAttribute' && (n.name?.name === 'className' || n.name?.name === 'class')) return true
    if (n.type === 'CallExpression') {
      const callee = n.callee
      const name = callee?.name ?? callee?.property?.name
      if (name === 'cn' || name === 'cva' || name === 'clsx' || name === 'twMerge') return true
    }
    if (n.type === 'VariableDeclarator') {
      const id = n.id?.name ?? ''
      if (/Variants$|Class(es)?$|^[A-Z0-9_]+$/.test(id)) return true
    }
    if (n.type === 'Property') {
      const key = n.key?.name ?? n.key?.value ?? ''
      if (/^class(Name)?$|Class(es)?$/.test(String(key))) return true
    }
    n = n.parent
  }
  return false
}

const CLASSY_TOKEN = /^-?[a-z0-9][a-z0-9:_\-./[\]()%&>*]*$/

/**
 * A class list is recognisable on its own, so a plain const, an object value or a
 * string returned from a helper is covered without naming every shape it can take.
 */
function looksLikeClassList(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 400) return false
  // A path or a URL is never a class list, and both can carry a hyphen.
  if (trimmed.includes('://') || trimmed.startsWith('/') || trimmed.startsWith('.')) return false
  const tokens = trimmed.split(/\s+/)
  if (!tokens.every((t) => CLASSY_TOKEN.test(t))) return false
  // Half or more must be utility-shaped, or prose that merely names a class is flagged.
  const utilities = tokens.filter((t) => t.includes('-') || t.includes(':')).length
  return utilities > 0 && utilities * 2 >= tokens.length
}

function eachClassString(report: (node: Node, value: string) => void) {
  const consider = (node: Node, value: string) => {
    if (!inClassContext(node) && !looksLikeClassList(value)) return
    report(node, value)
  }
  return {
    Literal(node: Node) {
      if (typeof node.value !== 'string') return
      consider(node, node.value)
    },
    TemplateElement(node: Node) {
      const raw = node.value?.cooked
      if (typeof raw !== 'string' || !raw.trim()) return
      consider(node, raw)
    },
  }
}

const PHYSICAL = [
  [/(^|[\s:])-?(ml|mr)-/, 'use ms- or me-'],
  [/(^|[\s:])-?(pl|pr)-/, 'use ps- or pe-'],
  [/(^|[\s:])-?(left|right)-/, 'use inset-s- or inset-e-'],
  [/(^|[\s:])-?(start|end)-\d/, 'start-* and end-* are deprecated; use inset-s- or inset-e-'],
  [/(^|[\s:])text-(left|right)(\s|$)/, 'use text-start or text-end'],
  [/(^|[\s:])border-(l|r)(-|\s|$)/, 'use border-s or border-e'],
  [/(^|[\s:])rounded-(l|r|tl|tr|bl|br)-/, 'use the logical rounded-s- or rounded-e- forms'],
  [/(^|[\s:])-?(space|divide)-x-/, 'use gap-*, or border-s on the item'],
  [/(^|[\s:])(float|clear)-(left|right)(\s|$)/, 'use float-start, float-end, clear-start or clear-end'],
  [/(^|[\s:])tracking-/, 'letter-spacing breaks Arabic script; never use it (R-5.3-3)'],
] as const

/** white and black are fixed colours; transparent and current are mode-agnostic and allowed. */
const PALETTE =
  /(^|[\s:])(bg|text|border|outline|ring|fill|stroke|from|via|to|divide|decoration|shadow|accent|caret|placeholder)-((slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)(\s|$|\/)/

/** The 148 CSS named colours. transparent and currentColor are not among them: they stay allowed. */
const NAMED_COLORS = new Set([
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown',
  'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan',
  'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred',
  'darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink',
  'deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold',
  'goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush',
  'lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey',
  'lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow',
  'lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen',
  'mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin',
  'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise',
  'palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue',
  'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow',
  'springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen',
].join(' ').split(' '))

/** CSS system colours, lower-cased: they only mean something once forced colours own the palette. */
const SYSTEM_COLORS = new Set([
  'canvas canvastext linktext visitedtext activetext buttonface buttontext buttonborder field fieldtext',
  'highlight highlighttext selecteditem selecteditemtext mark marktext graytext accentcolor accentcolortext',
].join(' ').split(' '))

const COLOR_FUNCTION = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|contrast-color)\(/

/** Splits a class at the colons between its variants, never at one inside brackets or parentheses. */
function splitAtColons(token: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < token.length; i++) {
    const ch = token[i]
    if (ch === '[' || ch === '(') depth++
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1)
    else if (ch === ':' && depth === 0) {
      parts.push(token.slice(start, i))
      start = i + 1
    }
  }
  parts.push(token.slice(start))
  return parts
}

/** What sits between a bracket and its match; to the end when a template cut the class short. */
function bracketContent(text: string, open: number): string {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '[') depth++
    else if (text[i] === ']' && --depth === 0) return text.slice(open + 1, i)
  }
  return text.slice(open + 1)
}

/**
 * The kind of colour a utility's arbitrary value is, if it is one. bg-[red], bg-[color:red],
 * [color:red] and [--tc-ring:red] all hold red, so the value decides and never the prefix.
 */
function arbitraryColor(utility: string): 'arbitrary' | 'system' | undefined {
  const bare = utility.replace(/^!/, '')
  const open = bare.indexOf('[')
  if (open === -1) return undefined
  const isProperty = open === 0
  if (!isProperty && !/^-?[a-z][a-z0-9-]*-$/.test(bare.slice(0, open))) return undefined
  const inner = bracketContent(bare, open)
  // A property name in [color:red], or the type a value declares in bg-[color:red].
  const head = /^(--)?[a-z][a-z0-9-]*:/.exec(inner)?.[0] ?? ''
  if (isProperty && head === '') return undefined
  const value = inner.slice(head.length).toLowerCase()
  if (SYSTEM_COLORS.has(value)) return 'system'
  if (NAMED_COLORS.has(value) || value.startsWith('#') || COLOR_FUNCTION.test(value)) return 'arbitrary'
  // bg-[color:var(--x)] declares a colour, whatever the variable holds.
  return !isProperty && head === 'color:' ? 'arbitrary' : undefined
}

/** The first class whose arbitrary value is a colour, unless it is a system colour behind forced-colors. */
function findArbitraryColor(value: string): { cls: string; kind: 'arbitrary' | 'system' } | undefined {
  for (const cls of value.split(/\s+/)) {
    const variants = splitAtColons(cls)
    const kind = arbitraryColor(variants.pop() ?? '')
    if (kind === undefined) continue
    if (kind === 'system' && variants.includes('forced-colors')) continue
    return { cls, kind }
  }
  return undefined
}

/** `data-[open]:` or `group-aria-[busy]/item:`: a bracket around a bare name, which v4 writes bare. */
const BRACKETED_VARIANT = /^((?:[a-z][a-z0-9-]*-)?(?:data|aria))-\[([^\]]*)\](\/[\w-]+)?$/

function findBracketedName(value: string): { cls: string; bare: string } | undefined {
  for (const cls of value.split(/\s+/)) {
    const variants = splitAtColons(cls)
    variants.pop()
    for (const variant of variants) {
      const m = BRACKETED_VARIANT.exec(variant)
      if (!m || m[2]?.includes('=')) continue
      return { cls: `${variant}:`, bare: `${m[1] ?? ''}-${m[2] ?? ''}${m[3] ?? ''}:` }
    }
  }
  return undefined
}

const BANNED_SCALE = [
  [/(^|[\s:])rounded-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|full)(\s|$)/, 'use rounded-control, rounded-box or rounded-chip'],
  [/(^|[\s:])h-\d+(\s|$)/, 'use h-control-xs .. h-control-xl from the size scale'],
  [/(^|[\s:])outline-\d+(\s|$)/, 'use FOCUS_RING from shared/classes'],
  [/(^|[\s:])border-\d+(\s|$)/, 'use BORDER or BORDER_STRONG from shared/classes'],
  [/(^|[\s:])duration-\d+(\s|$)/, 'use TRANSITION from shared/classes; durations read --tc-motion'],
] as const

const HAND_WRITTEN_STATE = /(^|[\s:])(hover|focus-visible|active):/

/** Lines of prose a JSDoc block may hold before it is an article (R-5.12-3). */
const PROSE_LIMIT = 3

/** `style`, `props.style` or `rest.style`: the caller's own, which must reach the element. */
function isConsumerStyle(node: Node): boolean {
  if (node?.type === 'Identifier') return node.name === 'style'
  if (node?.type === 'MemberExpression') return node.property?.name === 'style'
  return false
}

/**
 * A sibling export that is not a part: a skeleton or a state stands beside the component
 * rather than inside it, so `Card` next to `CardSkeleton` needs no `Root`.
 */
/** R-5.3-2: the one rtl: class PLAN section 7 writes out, the mirror of a directional icon. */
const ICON_MIRROR = 'rtl:-scale-x-100'

/** An x that needs no direction: none, a zero, or the pointer offset Base UI measures in physical px. */
const NEUTRAL_X = /^(-?0(px|%|rem)?|none|3d|var\(--[a-z]+-swipe-movement-x\b.*)$/

/** The arguments of the parenthesis that opens at `open`, split at its top-level commas. */
function callArguments(text: string, open: number): string[] {
  const args: string[] = []
  let depth = 0
  let start = open + 1
  for (let i = open; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(') depth++
    else if (ch === ')' && --depth === 0) return [...args, text.slice(start, i)]
    else if (ch === ',' && depth === 1) {
      args.push(text.slice(start, i))
      start = i + 1
    }
  }
  return [...args, text.slice(start)]
}

const dirAware = (x: string) => x.includes('--tc-dir') || NEUTRAL_X.test(x.trim())

/** A gradient angle along the block axis reads the same in both directions. */
function physicalGradient(spec: string): boolean {
  if (spec.includes('--tc-dir')) return false
  if (/(^|[\s_-])(left|right)(?![a-z])/.test(spec)) return true
  const angles = [...spec.matchAll(/(-?[\d.]+)(deg|turn|rad|grad)/g)]
  const half = { deg: 180, turn: 0.5, rad: Math.PI, grad: 200 } as const
  return angles.some(([, n, unit]) => Number(n) % half[unit as keyof typeof half] !== 0)
}

const POSITION = /^(object|bg)-(top|bottom|left|right|center)(-(top|bottom|left|right))?$|^object-[[(]|^bg-position-[[(]|^bg-\[position:/
const PHYSICAL_POSITION = /^(object|bg)-((left|right)(-(top|bottom))?|(top|bottom)-(left|right))$/
const DIR_VARIANT = /^(rtl|ltr)$|dir=["']?(rtl|ltr)|:dir\(/

/** Why a class string breaks R-5.3-2, with the offending class, or undefined when it keeps it. */
function findPhysicalMotion(value: string): { cls: string; hint: string } | undefined {
  const tokens = value.split(/\s+/).filter(Boolean)
  const hasDirPosition = tokens.some((cls) => {
    const variants = splitAtColons(cls)
    const utility = variants.pop() ?? ''
    return variants.some((v) => DIR_VARIANT.test(v)) && POSITION.test(utility)
  })
  for (const cls of tokens) {
    const variants = splitAtColons(cls)
    const utility = (variants.pop() ?? '').replace(/^!/, '')
    if (variants.some((v) => DIR_VARIANT.test(v))) {
      if (cls !== ICON_MIRROR && !POSITION.test(utility)) {
        return { cls, hint: 'uses a direction variant; only object-* and bg-* positions may, everything else multiplies by --tc-dir' }
      }
      continue
    }
    const translate = /^-?translate-(x-)?(.+)$/.exec(utility)
    if (translate && !/^[yz]-/.test(translate[2] ?? '')) {
      const value = translate[2] ?? ''
      const x = translate[1] || !value.startsWith('[') ? value : (value.slice(1, -1).split('_')[0] ?? '')
      if (!dirAware(x)) return { cls, hint: 'moves along a physical x; multiply it by --tc-dir, as translate-x-[calc(100%*var(--tc-dir))]' }
    }
    for (const m of utility.matchAll(/translate(X|3d)?\(/g)) {
      const x = callArguments(utility, m.index + m[0].length - 1)[0] ?? ''
      if (!dirAware(x)) return { cls, hint: 'translates along a physical x; multiply it by --tc-dir, as translateX(calc(100%*var(--tc-dir)))' }
    }
    const property = /^\[translate:([^_\]]+)/.exec(utility)
    if (property && !dirAware(property[1] ?? '')) return { cls, hint: 'translates along a physical x; multiply it by --tc-dir' }
    if (/^(origin-|\[transform-origin:)/.test(utility) && /(^|[-_[:])(left|right)(?![a-z])/.test(utility)) {
      return { cls, hint: 'pins the transform origin to a physical side; use one Base UI measures, as origin-(--transform-origin), or a centre or block edge' }
    }
    const gradient = /^-?bg-(linear|gradient)-(.+)$/.exec(utility)
    if (gradient) {
      const spec = gradient[2] ?? ''
      const side = /^to-(r|l|tr|tl|br|bl)$/.test(spec)
      const angle = /^\d+$/.test(spec) && Number(spec) % 180 !== 0
      if (side || angle || (/^[[(]/.test(spec) && physicalGradient(spec))) {
        return { cls, hint: 'points the gradient at a physical side; multiply the angle by --tc-dir, as bg-linear-[calc(90deg*var(--tc-dir))]' }
      }
    }
    for (const m of utility.matchAll(/linear-gradient\(/g)) {
      const first = callArguments(utility, m.index + m[0].length - 1)[0] ?? ''
      if (physicalGradient(first)) return { cls, hint: 'points the gradient at a physical side; multiply the angle by --tc-dir' }
    }
    if (PHYSICAL_POSITION.test(utility) && !hasDirPosition) {
      return { cls, hint: 'is a physical position with no logical form; pair it with its rtl: mirror' }
    }
  }
  return undefined
}

const NOT_A_PART = /^(Skeleton|EmptyState|ErrorState|Client|Provider|Context|Variants|Props)$/

const rules = {
  'logical-properties-only': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.3-1, R-5.3-3: logical utilities only; never physical left or right.' },
      schema: [],
      messages: { physical: 'R-5.3-1: "{{cls}}" is physical. {{hint}}.' },
    },
    create(ctx: Context) {
      return eachClassString((node, value) => {
        for (const [re, hint] of PHYSICAL) {
          const m = re.exec(value)
          if (m) {
            ctx.report({ node, messageId: 'physical', data: { cls: m[0].trim(), hint } })
            return
          }
        }
      })
    },
  },

  'dir-aware-transforms': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.3-2: translate, transform origin and gradient direction follow --tc-dir; rtl: is for object-* and bg-* positions.' },
      schema: [],
      messages: { physical: 'R-5.3-2: "{{cls}}" {{hint}}.' },
    },
    create(ctx: Context) {
      return eachClassString((node, value) => {
        const found = findPhysicalMotion(value)
        if (found) ctx.report({ node, messageId: 'physical', data: found })
      })
    },
  },

  'semantic-classes-only': {
    meta: {
      type: 'problem' as const,
      docs: {
        description:
          'R-5.2-1: semantic tokens only; no palette, no arbitrary colour, no dark: variant.'
          + ' A CSS system colour passes only behind forced-colors:.',
      },
      schema: [],
      messages: {
        palette: 'R-5.2-1: "{{cls}}" names a palette colour. Use a semantic class such as bg-primary-solid or text-body.',
        arbitrary: 'R-5.2-1: "{{cls}}" is an arbitrary colour. Use a semantic token.',
        system: 'R-5.2-1: "{{cls}}" is a CSS system colour, which is allowed only behind the forced-colors: variant.',
        dark: 'R-5.2-1: the dark: variant is banned. Modes are set by data-theme, so one class covers every mode.',
      },
    },
    create(ctx: Context) {
      return eachClassString((node, value) => {
        const p = PALETTE.exec(value)
        if (p) return ctx.report({ node, messageId: 'palette', data: { cls: p[0].trim() } })
        const a = findArbitraryColor(value)
        if (a) return ctx.report({ node, messageId: a.kind, data: { cls: a.cls } })
        if (/(^|[\s:])dark:/.test(value)) ctx.report({ node, messageId: 'dark' })
      })
    },
  },

  'no-dynamic-class-names': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.2-3: never build a class name from an expression.' },
      schema: [],
      messages: {
        dynamic: 'R-5.2-3: class names are never built from an expression. Use a lookup object or cva variants.',
      },
    },
    create(ctx: Context) {
      return {
        TemplateLiteral(node: Node) {
          if (node.expressions.length === 0) return
          if (!inClassContext(node.quasis[0] ?? node)) return
          // An interpolation is only a problem when it sits inside a class token,
          // so `${A} ${B}` of whole constants is allowed but `bg-${tone}` is not.
          const parts: string[] = node.quasis.map((q: Node) => String(q.value.cooked ?? ''))
          const splicesIntoToken = parts.some((part, i) => {
            const endsOpen = i < parts.length - 1 && /[\w-]$/.test(part)
            const startsOpen = i > 0 && /^[\w-]/.test(part)
            return endsOpen || startsOpen
          })
          if (splicesIntoToken) ctx.report({ node, messageId: 'dynamic' })
        },
      }
    },
  },

  'shared-class-constants': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.2-4: sizes, radius, focus ring, hover and transitions come from the knobs.' },
      schema: [],
      messages: { banned: 'R-5.2-4: "{{cls}}" is hand-written. {{hint}}.' },
    },
    create(ctx: Context) {
      // classes.ts is where the shared constants are defined, so it is the one
      // place these strings are allowed to be written out.
      const file = String(ctx.filename ?? ctx.getFilename?.() ?? '')
      if (/(^|[\\/])classes\.ts$/.test(file)) return {}
      return eachClassString((node, value) => {
        for (const [re, hint] of BANNED_SCALE) {
          const m = re.exec(value)
          if (m) return ctx.report({ node, messageId: 'banned', data: { cls: m[0].trim(), hint } })
        }
        const s = HAND_WRITTEN_STATE.exec(value)
        if (s) {
          ctx.report({
            node,
            messageId: 'banned',
            data: { cls: s[0].trim(), hint: 'use HOVER, FOCUS_RING or the shared state constants' },
          })
        }
      })
    },
  },

  'bare-data-variants': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.2-6: data and aria variants are written bare; brackets only hold name=value.' },
      schema: [],
      messages: { bracketed: 'R-5.2-6: "{{cls}}" brackets a bare name. Write "{{bare}}"; brackets only hold name=value.' },
    },
    create(ctx: Context) {
      return eachClassString((node, value) => {
        const b = findBracketedName(value)
        if (b) ctx.report({ node, messageId: 'bracketed', data: b })
      })
    },
  },

  'no-enum': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-8.3-5: value lists are as const arrays; a TypeScript enum survives into the bundle.' },
      schema: [],
      messages: { enum: 'R-8.3-5: enum survives into the bundle. Use an `as const` array and derive the union.' },
    },
    create(ctx: Context) {
      return {
        TSEnumDeclaration(node: Node) {
          ctx.report({ node, messageId: 'enum' })
        },
      }
    },
  },

  'icon-loaders-stay-server': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-7-1: the loader map is imported only inside components/icon.' },
      schema: [],
      messages: {
        leak:
          'R-7-1: "{{source}}" pulls {{what}} into whatever bundle imports it. '
          + 'Only components/icon may import it; elsewhere use <Svg icon={x}> with a per-icon import.',
      },
    },
    create(ctx: Context) {
      const file = String(ctx.filename ?? ctx.getFilename()).replace(/\\/g, '/')
      const allowed = /(^|\/)src\/components\/icon\//.test(file)

      const check = (node: Node, raw: unknown) => {
        if (allowed || typeof raw !== 'string') return
        if (!/loaders\.generated/.test(raw)) return
        ctx.report({ node, messageId: 'leak', data: { source: raw, what: 'the icon loader map' } })
      }

      // Every form that pulls a module in, not only the static import declaration.
      return {
        ImportDeclaration: (node: Node) => { check(node, node.source?.value) },
        ExportNamedDeclaration: (node: Node) => { check(node, node.source?.value) },
        ExportAllDeclaration: (node: Node) => { check(node, node.source?.value) },
        ImportExpression: (node: Node) => { check(node, node.source?.value) },
        TSImportType: (node: Node) => { check(node, node.argument?.literal?.value) },
        CallExpression: (node: Node) => {
          const callee = node.callee
          const isRequire = callee?.type === 'Identifier' && callee.name === 'require'
          const isDynamic = callee?.type === 'Import'
          if (isRequire || isDynamic) check(node, node.arguments?.[0]?.value)
        },
      }
    },
  },

  'one-line-comments': {
    meta: {
      type: 'suggestion' as const,
      docs: { description: 'R-5.12-3: comments are one line, only for what the code cannot say.' },
      schema: [],
      messages: {
        paragraph: 'R-5.12-3: comments are one line. Say what the code cannot, or say nothing.',
        commentedCode: 'R-5.12-3: no commented-out code.',
        essay: 'R-5.12-3: a doc block is {{lines}} lines of prose. Three is the limit; the rest belongs in docs/DECISIONS.md.',
      },
    },
    create(ctx: Context) {
      const source = ctx.sourceCode ?? ctx.getSourceCode()
      return {
        Program() {
          const comments = source.getAllComments()
          let run: Node[] = []
          const flushRun = () => {
            if (run.length > 1) ctx.report({ node: run[0], messageId: 'paragraph' })
            run = []
          }
          for (const c of comments) {
            if (c.type === 'Block') {
              const lines = c.value.split('\n').filter((l: string) => l.trim())
              const isDoc = c.value.trim().startsWith('*')
              // A JSDoc block documents an export, so it may pass one line. Three is
              // where a comment stops explaining and starts being an article.
              if (isDoc && lines.length > PROSE_LIMIT) {
                ctx.report({ node: c, messageId: 'essay', data: { lines: String(lines.length) } })
              }
              if (lines.length > 1 && !isDoc) ctx.report({ node: c, messageId: 'paragraph' })
              flushRun()
              continue
            }
            const text = c.value.trim()
            if (/^(eslint|@ts-|prettier|TODO|biome)/.test(text)) { flushRun(); continue }
            // Prose may name a keyword, so this looks for code shape, not a leading word.
            const looksLikeCode =
              /;\s*$/.test(text) ||
              /^[{}]\s*$/.test(text) ||
              /^(const|let|var)\s+\w+\s*=/.test(text) ||
              /^(import|export)\b[^.]*\bfrom\b/.test(text) ||
              /^(function|class)\s+\w+\s*[({]/.test(text) ||
              /^(if|for|while|switch)\s*\(/.test(text)
            if (looksLikeCode) ctx.report({ node: c, messageId: 'commentedCode' })
            const prev = run[run.length - 1]
            const prevLine: number = prev ? Number(prev.loc.end.line) : -1
            if (prev && Number(c.loc.start.line) === prevLine + 1) run.push(c)
            else { flushRun(); run = [c] }
          }
          flushRun()
        },
      }
    },
  },

  'no-derived-expectations': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-17-1: a test expectation is named, never derived from what it tests.' },
      schema: [],
      messages: {
        derived:
          'R-17-1: this expectation is derived from {{source}}, so deleting half of it deletes'
          + ' half the expectation. Name the expected value literally.',
      },
    },
    create(ctx: Context) {
      const file = String(ctx.filename ?? ctx.getFilename?.() ?? '')
      if (!/\.test\.tsx?$/.test(file)) return {}

      // An imported binding is the thing under test; a literal in the file is the fixture.
      const imported = new Set<string>()

      function derivedFrom(node: Node): string | null {
        if (!node || node.type !== 'CallExpression') return null
        const callee = node.callee
        const method = callee?.property?.name
        const object = callee?.object

        if (method === 'split') {
          if (object?.type === 'Identifier' && imported.has(object.name)) return object.name
          const root = object?.type === 'MemberExpression' ? object.object : null
          if (root?.type === 'Identifier' && imported.has(root.name)) return root.name
        }
        if (['values', 'keys', 'entries'].includes(method) && callee?.object?.name === 'Object') {
          const arg = node.arguments?.[0]
          if (arg?.type === 'Identifier' && imported.has(arg.name)) return arg.name
        }
        if (callee?.name === 'readdirSync') return 'the directory listing'
        return null
      }

      const MATCHERS = new Set(['toEqual', 'toStrictEqual', 'toContain', 'toHaveLength', 'toBe'])

      return {
        ImportDeclaration(node: Node) {
          if (node.importKind === 'type') return
          for (const spec of node.specifiers ?? []) {
            if (spec.importKind === 'type') continue
            if (spec.local?.name) imported.add(spec.local.name)
          }
        },
        CallExpression(node: Node) {
          if (!MATCHERS.has(node.callee?.property?.name)) return
          for (const arg of node.arguments ?? []) {
            const source = derivedFrom(arg)
              ?? derivedFrom(arg?.callee?.object)
              ?? (arg?.type === 'MemberExpression' ? derivedFrom(arg.object) : null)
            if (source) ctx.report({ node: arg, messageId: 'derived', data: { source } })
          }
        },
      }
    },
  },

  'style-sets-tokens-only': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.2-5: the style prop may only set a --tc-* custom property.' },
      schema: [],
      messages: {
        property: 'R-5.2-5: style only sets a --tc-* variable. "{{name}}" is a CSS property; use a class.',
        opaque: 'R-5.2-5: style must be an object literal of --tc-* names, so the rule can read it.',
      },
    },
    create(ctx: Context) {
      return {
        JSXAttribute(node: Node) {
          if (node.name?.name !== 'style') return
          const value = node.value
          if (value?.type !== 'JSXExpressionContainer') return
          const expression = value.expression
          // The consumer's own style has to survive, whether passed through or merged.
          if (isConsumerStyle(expression)) return
          if (expression?.type !== 'ObjectExpression') {
            ctx.report({ node, messageId: 'opaque' })
            return
          }
          for (const prop of expression.properties ?? []) {
            if (prop.type === 'SpreadElement') {
              if (!isConsumerStyle(prop.argument)) ctx.report({ node: prop, messageId: 'opaque' })
              continue
            }
            const name = String(prop.key?.value ?? prop.key?.name ?? '')
            if (!name.startsWith('--tc-')) ctx.report({ node: prop, messageId: 'property', data: { name } })
          }
        },
      }
    },
  },

  'presence-state-attributes': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.7-6: presence attributes such as data-open, never data-state="open".' },
      schema: [],
      messages: {
        state: 'R-5.7-6: data-state belongs to Base UI, not to us. Emit data-{{value}} as a presence attribute.',
        valued: 'R-5.7-6: "{{name}}" is a state, so it is present or absent. Only a design prop carries a value.',
      },
    },
    create(ctx: Context) {
      const STATEFUL = /^data-(open|closed|loading|disabled|busy|checked|selected|active|pressed|expanded)$/
      const flag = (node: Node, name: string, raw: string | null) => {
        if (name === 'data-state') {
          ctx.report({ node, messageId: 'state', data: { value: raw ?? 'open' } })
          return
        }
        if (STATEFUL.test(name) && raw !== null && raw !== '') {
          ctx.report({ node, messageId: 'valued', data: { name } })
        }
      }
      return {
        JSXAttribute(node: Node) {
          const name = String(node.name?.name ?? '')
          if (!name.startsWith('data-')) return
          const value = node.value
          flag(node, name, value?.type === 'Literal' ? String(value.value) : null)
        },
        Property(node: Node) {
          const name = String(node.key?.value ?? node.key?.name ?? '')
          if (!name.startsWith('data-')) return
          const literal = node.value?.type === 'Literal' && typeof node.value.value === 'string'
          flag(node, name, literal ? String(node.value.value) : null)
        },
      }
    },
  },

  'flat-part-exports': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-9.2-3: export flat names; never an object a server file would dot into.' },
      schema: [],
      messages: {
        namespace: 'R-9.2-3: export {{name}}Root and {{name}}{{part}} separately. An object pulls every part in and breaks across the use client boundary.',
      },
    },
    create(ctx: Context) {
      const isComponent = (name: string) => /^[A-Z][A-Za-z0-9]*$/.test(name)
      return {
        VariableDeclarator(node: Node) {
          const name = String(node.id?.name ?? '')
          if (!isComponent(name) || node.init?.type !== 'ObjectExpression') return
          const properties = (node.init.properties ?? []).filter((p: Node) => p.type === 'Property')
          const parts = properties.map((p: Node) => String(p.key?.name ?? p.key?.value ?? ''))
          // A namespace holds references to components. A lookup holds class strings, and
          // `const Tone = { Primary: 'tone-primary' }` is a lookup however it is spelled.
          const references = properties.every((p: Node) =>
            p.value?.type === 'Identifier' || p.value?.type === 'MemberExpression')
          if (parts.length < 2 || !parts.every(isComponent) || !references) return
          const part = parts.find((p: string) => p !== 'Root') ?? 'Header'
          ctx.report({ node, messageId: 'namespace', data: { name, part } })
        },
      }
    },
  },

  'root-part-is-named-root': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-9.2-4: a component split into parts names its root <Name>Root.' },
      schema: [],
      messages: {
        bare: 'R-9.2-4: {{name}} is the root of {{name}}{{part}}, so it is named {{name}}Root without exception.',
      },
    },
    create(ctx: Context) {
      const exported = new Map<string, Node>()
      const keep = (node: Node, name: string) => {
        if (/^[A-Z][A-Za-z0-9]*$/.test(name)) exported.set(name, node)
      }
      return {
        'ExportNamedDeclaration > FunctionDeclaration'(node: Node) {
          keep(node, String(node.id?.name ?? ''))
        },
        'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node: Node) {
          keep(node, String(node.id?.name ?? ''))
        },
        'Program:exit'() {
          for (const [name, node] of exported) {
            const part = [...exported.keys()]
              .filter((other) => other !== name && other.startsWith(name))
              .map((other) => other.slice(name.length))
              .find((suffix) => suffix !== '' && !NOT_A_PART.test(suffix))
            if (part === undefined) continue
            ctx.report({ node, messageId: 'bare', data: { name, part } })
          }
        },
      }
    },
  },

  'text-comes-from-labels': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.11-1: every built-in string comes from the labels prop.' },
      schema: [],
      messages: {
        hardcoded: 'R-5.11-1: "{{text}}" is built-in English. Take it from labels, which ships an Arabic default.',
      },
    },
    create(ctx: Context) {
      const LABELLED = new Set(['aria-label', 'aria-valuetext', 'aria-placeholder', 'alt', 'placeholder', 'title'])
      /** Two letters or more, so a chevron, a bullet or a separator is not prose. */
      const isProse = (text: string) => /[A-Za-z]{2,}/.test(text)
      return {
        JSXText(node: Node) {
          const text = String(node.value ?? '').trim()
          if (isProse(text)) ctx.report({ node, messageId: 'hardcoded', data: { text: text.slice(0, 40) } })
        },
        JSXAttribute(node: Node) {
          if (!LABELLED.has(String(node.name?.name ?? ''))) return
          const value = node.value
          if (value?.type !== 'Literal' || typeof value.value !== 'string') return
          if (isProse(value.value)) {
            ctx.report({ node, messageId: 'hardcoded', data: { text: value.value.slice(0, 40) } })
          }
        },
      }
    },
  },
  'no-fetch-in-components': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-8.5-2: components never fetch, cache or paginate; the app owns the data.' },
      schema: [
        {
          type: 'object',
          properties: { allow: { type: 'array', items: { type: 'string' } } },
          additionalProperties: false,
        },
      ],
      messages: {
        data:
          'R-8.5-2: {{what}} makes the component own data. The app fetches, caches and pages; '
          + 'take the data as props and call loadMore().',
      },
    },
    create(ctx: Context) {
      const file = String(ctx.filename ?? ctx.getFilename()).replace(/\\/g, '/')
      if (!/(^|\/)src\/(components|connectors|shared)\//.test(file)) return {}
      const allow = new Set((ctx.options?.[0]?.allow ?? []) as string[])
      const GLOBALS = new Set(['XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB', 'caches', 'unstable_cache'])
      const HOSTS = new Set(['window', 'globalThis', 'self'])

      const report = (node: Node, name: string, what = name) => {
        if (!allow.has(name)) ctx.report({ node, messageId: 'data', data: { what } })
      }
      /** A property key or a non-computed member name is not a reference to the global. */
      const isReference = (node: Node) => {
        const p = node.parent
        if (p?.type === 'MemberExpression' && p.property === node && !p.computed) return false
        if ((p?.type === 'Property' || p?.type === 'MethodDefinition' || p?.type === 'PropertyDefinition') && p.key === node && !p.computed) return false
        if (p?.type === 'TSPropertySignature' && p.key === node) return false
        return !/^Import|^Export/.test(String(p?.type))
      }
      const calleeName = (callee: Node): string | undefined => {
        if (callee?.type === 'Identifier') return callee.name
        if (callee?.type === 'MemberExpression' && !callee.computed && HOSTS.has(callee.object?.name)) return callee.property?.name
        return undefined
      }

      return {
        ImportDeclaration(node: Node) {
          const source = node.source?.value
          if (source === 'next/cache') report(node, 'next/cache', '"next/cache"')
          if (source !== 'react') return
          for (const s of node.specifiers ?? []) {
            if (s.type === 'ImportSpecifier' && (s.imported?.name ?? s.imported?.value) === 'cache') {
              report(s, 'cache', "React's cache()")
            }
          }
        },
        Identifier(node: Node) {
          if (GLOBALS.has(node.name) && isReference(node)) report(node, node.name)
        },
        MemberExpression(node: Node) {
          const name = node.property?.name
          if (node.computed || !HOSTS.has(node.object?.name) || !GLOBALS.has(name)) return
          report(node.property, name, `${node.object.name}.${name}`)
        },
        CallExpression(node: Node) {
          const name = calleeName(node.callee)
          if (name === 'fetch') report(node, 'fetch', 'fetch()')
          const c = node.callee
          if (c?.type === 'MemberExpression' && c.object?.name === 'React' && c.property?.name === 'cache') {
            report(node, 'cache', "React's cache()")
          }
        },
        NewExpression(node: Node) {
          if (calleeName(node.callee) === 'Request') report(node, 'Request', 'new Request()')
        },
      }
    },
  },
}

export default { rules } satisfies ESLint.Plugin
