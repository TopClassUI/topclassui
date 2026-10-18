import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { GUIDES } from '../../lib/guides'
import { highlight } from '../../lib/highlight'

/** A mode's block exactly as tokens.css writes it, read by docs:data, never typed into the page (docs-site pages 7 and 9). */
export async function TokensSample({ mode, locale }: { mode: 'dark' | 'ocean'; locale: Locale }) {
  const code = GUIDES.modeBlocks[mode]
  const highlighted = await highlight(code, 'css')
  return (
    <CodeBlock {...getLabels(locale)} lang="css" title={guideLabelsFor(locale).sample.title} highlighted={highlighted ?? undefined}>
      {code}
    </CodeBlock>
  )
}
