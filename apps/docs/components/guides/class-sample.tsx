import { FOCUS_RING, TOUCH_TARGET } from 'topclassui/classes'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { CodeFrame } from '../mdx/code-frame'

const CLASSES = { TOUCH_TARGET, FOCUS_RING } as const

/** The module the constants come from, which names the block: a file name, the same in every language. */
const MODULE = 'topclassui/classes'

/** A class string as source, about fifty characters a line joined with +, so a narrow column never scrolls far. */
export function definitionOf(name: string, value: string): string {
  const lines: string[] = []
  for (const part of value.split(' ')) {
    const last = lines.at(-1)
    if (last !== undefined && last.length + part.length < 50) lines[lines.length - 1] = `${last} ${part}`
    else lines.push(lines.length === 0 ? part : ` ${part}`)
  }
  return `export const ${name} =\n${lines.map((line) => `  '${line}'`).join(' +\n')}`
}

/** A shared class as the package defines it, printed from topclassui/classes, never typed (docs-site page 12). */
export async function ClassSample({ name, locale }: { name: keyof typeof CLASSES; locale: Locale }) {
  const code = definitionOf(name, CLASSES[name])
  const highlighted = await highlight(code, 'ts')
  return <CodeFrame code={code} locale={locale} lang="ts" title={MODULE} highlighted={highlighted} />
}
