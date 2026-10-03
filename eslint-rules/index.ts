// The rules of docs/RULES.md that a linter can enforce. Rule ids are in the messages.
import type { ESLint } from 'eslint'

type Node = any
type Context = any

/** A string literal only matters when it can become a class name. */
function inClassContext(node: Node): boolean {
  let n = node.parent
  let depth = 0
  while (n && depth++ < 12) {
    if (n.type === 'JSXAttribute' && n.name?.name === 'className') return true
    if (n.type === 'CallExpression') {
      const callee = n.callee
      const name = callee?.name ?? callee?.property?.name
      if (name === 'cn' || name === 'cva' || name === 'clsx' || name === 'twMerge') return true
    }
    if (n.type === 'VariableDeclarator') {
      const id = n.id?.name ?? ''
      if (/Variants$|^[A-Z0-9_]+$/.test(id)) return true
    }
    n = n.parent
  }
  return false
}

function eachClassString(report: (node: Node, value: string) => void) {
  return {
    Literal(node: Node) {
      if (typeof node.value !== 'string') return
      if (!inClassContext(node)) return
      report(node, node.value)
    },
    TemplateElement(node: Node) {
      const raw = node.value?.cooked
      if (typeof raw !== 'string' || !raw.trim()) return
      if (!inClassContext(node)) return
      report(node, raw)
    },
  }
}

const PHYSICAL = [
  [/(^|[\s:])(ml|mr)-/, 'use ms- or me-'],
  [/(^|[\s:])(pl|pr)-/, 'use ps- or pe-'],
  [/(^|[\s:])(left|right)-/, 'use inset-s- or inset-e-'],
  [/(^|[\s:])(start|end)-\d/, 'start-* and end-* are deprecated; use inset-s- or inset-e-'],
  [/(^|[\s:])text-(left|right)(\s|$)/, 'use text-start or text-end'],
  [/(^|[\s:])border-(l|r)(-|\s|$)/, 'use border-s or border-e'],
  [/(^|[\s:])rounded-(l|r|tl|tr|bl|br)-/, 'use the logical rounded-s- or rounded-e- forms'],
  [/(^|[\s:])(space|divide)-x-/, 'use gap-*, or border-s on the item'],
  [/(^|[\s:])tracking-/, 'letter-spacing breaks Arabic script; never use it (R-5.3-3)'],
] as const

const PALETTE =
  /(^|[\s:])(bg|text|border|outline|ring|fill|stroke|from|via|to|divide|decoration|shadow|accent|caret|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}/

const ARBITRARY_COLOR =
  /(^|[\s:])(bg|text|border|outline|ring|fill|stroke|shadow|accent|caret|placeholder)-\[(#|rgb|hsl|oklch|color)/

const BANNED_SCALE = [
  [/(^|[\s:])rounded-(none|sm|md|lg|xl|2xl|3xl|full)(\s|$)/, 'use rounded-control, rounded-box or rounded-chip'],
  [/(^|[\s:])h-\d+(\s|$)/, 'use h-control-xs .. h-control-xl from the size scale'],
  [/(^|[\s:])outline-\d+(\s|$)/, 'use FOCUS_RING from shared/classes'],
  [/(^|[\s:])duration-\d+(\s|$)/, 'use TRANSITION from shared/classes; durations read --tc-motion'],
] as const

const HAND_WRITTEN_STATE = /(^|\s)(hover|focus-visible|active):/

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

  'semantic-classes-only': {
    meta: {
      type: 'problem' as const,
      docs: { description: 'R-5.2-1: semantic tokens only; no palette, no arbitrary colour, no dark: variant.' },
      schema: [],
      messages: {
        palette: 'R-5.2-1: "{{cls}}" names a palette colour. Use a semantic class such as bg-primary-solid or text-body.',
        arbitrary: 'R-5.2-1: "{{cls}}" is an arbitrary colour. Use a semantic token.',
        dark: 'R-5.2-1: the dark: variant is banned. Modes are set by data-theme, so one class covers every mode.',
      },
    },
    create(ctx: Context) {
      return eachClassString((node, value) => {
        const p = PALETTE.exec(value)
        if (p) return ctx.report({ node, messageId: 'palette', data: { cls: p[0].trim() } })
        const a = ARBITRARY_COLOR.exec(value)
        if (a) return ctx.report({ node, messageId: 'arbitrary', data: { cls: a[0].trim() } })
        if (/(^|\s)dark:/.test(value)) ctx.report({ node, messageId: 'dark' })
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

  'one-line-comments': {
    meta: {
      type: 'suggestion' as const,
      docs: { description: 'R-5.12-3: comments are one line, only for what the code cannot say.' },
      schema: [],
      messages: {
        paragraph: 'R-5.12-3: comments are one line. Say what the code cannot, or say nothing.',
        commentedCode: 'R-5.12-3: no commented-out code.',
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
              // A directive block or a JSDoc block is allowed; prose is not.
              const lines = c.value.split('\n').filter((l: string) => l.trim())
              if (lines.length > 1 && !c.value.trim().startsWith('*')) {
                ctx.report({ node: c, messageId: 'paragraph' })
              }
              flushRun()
              continue
            }
            const text = c.value.trim()
            if (/^(eslint|@ts-|prettier|TODO|biome)/.test(text)) { flushRun(); continue }
            if (/[;{}]$|^(const|let|var|function|import|export|return|if|for)\b/.test(text)) {
              ctx.report({ node: c, messageId: 'commentedCode' })
            }
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
}

export default { rules } satisfies ESLint.Plugin
