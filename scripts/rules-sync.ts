// R-23: docs/RULES.md is the single source; CLAUDE.md, AGENTS.md and the Cursor
// rules are generated from it, and `--check` fails when any of them has drifted.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SOURCE = join(ROOT, 'docs', 'RULES.md')

const TARGETS = [
  { path: join(ROOT, 'CLAUDE.md'), frontMatter: '' },
  { path: join(ROOT, 'AGENTS.md'), frontMatter: '' },
  {
    path: join(ROOT, '.cursor', 'rules', 'topclassui.mdc'),
    frontMatter: ['---', 'description: TopClass UI rules', 'alwaysApply: true', '---', ''].join('\n'),
  },
]

const HEADER = [
  '<!-- Generated from docs/RULES.md by `pnpm rules:sync`. Do not edit. -->',
  '',
  '# TopClass UI - working rules',
  '',
  'Read docs/STATUS.md first for where things stand. The full specification is docs/PLAN.md; the rules below are the complete list; do not deviate without a docs/DECISIONS.md entry.',
  '',
].join('\n')

interface Rule {
  id: string
  title: string
  rule: string
  enforcedBy: string
}

/** Pull the shared prose sections and every rule out of the source. */
function parse(source: string) {
  const lines = source.split(/\r?\n/)
  const sections: { heading: string; rules: Rule[] }[] = []
  const prose: Record<string, string[]> = {}

  let section: { heading: string; rules: Rule[] } | null = null
  let proseKey: string | null = null
  let current: Partial<Rule> | null = null

  const flushRule = () => {
    if (current?.id && current.rule) {
      section?.rules.push({
        id: current.id,
        title: current.title ?? '',
        rule: current.rule,
        enforcedBy: current.enforcedBy ?? 'manual',
      })
    }
    current = null
  }

  for (const line of lines) {
    const h2 = /^## (.+)$/.exec(line)
    if (h2) {
      flushRule()
      const name = h2[1]!.trim()
      if (name === 'Commands' || name === 'How to work') {
        section = null
        proseKey = name
        prose[name] = []
      } else {
        proseKey = null
        section = { heading: name, rules: [] }
        sections.push(section)
      }
      continue
    }

    const h3 = /^### (R-[\w.-]+)\s*(.*)$/.exec(line)
    if (h3) {
      flushRule()
      current = { id: h3[1]!, title: h3[2]!.trim() }
      continue
    }

    if (current) {
      const r = /^\*\*Rule:\*\*\s*(.+)$/.exec(line)
      if (r) { current.rule = r[1]!.trim(); continue }
      const e = /^\*\*Enforced by:\*\*\s*(.+)$/.exec(line)
      if (e) { current.enforcedBy = e[1]!.trim(); continue }
    }

    if (proseKey) prose[proseKey]!.push(line)
  }
  flushRule()

  return { sections, prose }
}

/** One short enforcer name: no backticks, no path, no parenthetical. */
function cleanEnforcer(raw: string) {
  return raw
    .replace(/\([^)]*\)/g, '')
    .replace(/`/g, '')
    .replace(/scripts\//g, '')
    .replace(/\.ts\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** A rule reads as a sentence, so it starts with a capital unless it starts with code. */
function asSentence(rule: string) {
  if (rule.startsWith('`')) return rule
  return rule.charAt(0).toUpperCase() + rule.slice(1)
}

function render(source: string) {
  const { sections, prose } = parse(source)
  const out: string[] = [HEADER]

  for (const key of ['Commands', 'How to work']) {
    const body = (prose[key] ?? []).join('\n').trim()
    if (body) out.push(`## ${key}\n\n${body}\n`)
  }

  for (const s of sections) {
    if (!s.rules.length) continue
    out.push(`## ${s.heading}\n`)
    for (const r of s.rules) {
      out.push(`- **${r.id}** ${asSentence(r.rule)} _(${cleanEnforcer(r.enforcedBy)})_`)
    }
    out.push('')
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

function readIfPresent(path: string) {
  try { return readFileSync(path, 'utf8') } catch { return '' }
}

const check = process.argv.includes('--check')
const source = readFileSync(SOURCE, 'utf8')
const body = render(source)

const drifted: string[] = []
for (const target of TARGETS) {
  const expected = target.frontMatter ? `${target.frontMatter}\n${body}` : body
  const actual = readIfPresent(target.path)
  if (actual === expected) continue
  if (check) drifted.push(target.path.replace(ROOT, '.'))
  else writeFileSync(target.path, expected, { encoding: 'utf8' })
}

if (check) {
  if (drifted.length) {
    console.error(`rules-sync: ${drifted.length} file${drifted.length === 1 ? '' : 's'} differ from docs/RULES.md:`)
    for (const d of drifted) console.error(`  ${d}`)
    console.error('\nRun `pnpm rules:sync` and commit the result.')
    process.exit(1)
  }
  console.log('rules-sync: ok, all generated files match docs/RULES.md')
} else {
  console.log(`rules-sync: wrote ${TARGETS.length} files from docs/RULES.md`)
}
