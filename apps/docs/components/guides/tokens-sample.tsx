import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { GUIDES } from '../../lib/guides'
import { highlight } from '../../lib/highlight'
import { CodeFrame } from '../mdx/code-frame'

/** The lines of a mode's block that declare one of `names`, each with the comment above it, groups kept apart as the source keeps them. */
export function excerptOf(block: string, names: readonly string[]): string {
  const lines = block.split('\n')
  const kept: string[] = [lines[0] ?? '']
  let gap = false
  lines.slice(1, -1).forEach((line, index, body) => {
    if (line.trim() === '') { gap = true; return }
    const name = /^\s*(--[a-z0-9-]+):/.exec(line)?.[1]
    if (name === undefined || !names.includes(name)) return
    const above = body[index - 1]
    if (gap && kept.length > 1) kept.push('')
    gap = false
    if (above !== undefined && above.trim().startsWith('/*')) kept.push(above)
    kept.push(line)
  })
  kept.push(lines.at(-1) ?? '}')
  return kept.join('\n')
}

/** A mode's block exactly as tokens.css writes it, or the lines of it a page names, read by docs:data, never typed into the page (docs-site pages 7 and 9). */
export async function TokensSample({ mode, names, locale }: { mode: 'dark' | 'ocean'; names?: readonly string[] | undefined; locale: Locale }) {
  const code = names === undefined ? GUIDES.modeBlocks[mode] : excerptOf(GUIDES.modeBlocks[mode], names)
  const highlighted = await highlight(code, 'css')
  return (
    <CodeFrame code={code} locale={locale} lang="css" title={guideLabelsFor(locale).sample.title} highlighted={highlighted ?? undefined} />
  )
}
