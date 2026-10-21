import { BORDER } from 'topclassui/classes'
import { CodeBlock } from 'topclassui/code-block'
import { Icon } from 'topclassui/icon'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { FACTS } from '../../lib/data'
import { highlight } from '../../lib/highlight'
import { DOCS_CODE, PANEL } from '../classes'

/** The library's own commands, run from the root of its repository. */
const COMMANDS = { setup: 'pnpm install', e2e: 'pnpm test:e2e', contrast: 'pnpm check:contrast', all: 'pnpm check' } as const

/** Tested, not promised: what the library's gates check today, counted at build time (choice 11), and the commands that run them. */
export async function TestedPanel({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.proof.tested
  const { pages, contrastPairs } = FACTS.checks
  const rows = [text.axe(pages), text.target(pages), text.focus(pages), text.contrast(contrastPairs)]
  const comments = { ...text.commands, contrast: text.commands.contrast(contrastPairs) }
  const script = (['setup', 'e2e', 'contrast', 'all'] as const).map((key) => `# ${comments[key]}\n${COMMANDS[key]}`).join('\n\n')
  return (
    <div className={PANEL}>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-body">{text.title}</h3>
        <p className="text-xs text-muted">{text.lead}</p>
      </div>
      <ul className={`flex flex-col gap-1 rounded-box bg-page p-3 ${BORDER}`}>
        {rows.map((row) => (
          <li key={row} className="flex items-start gap-2 rounded-control bg-surface px-2 py-2.5 text-xs text-body">
            <span className="text-success-on-soft"><Icon name="check-circle" size="0.875rem" /></span>
            <span>{row}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-xs font-medium text-muted">{text.run}</p>
        {/* Beside taller neighbours the well grows to the panel's foot, its rows kept at the top. */}
        <CodeBlock {...getLabels(locale)} lang="bash" title={labels.blocks.terminal} className={`${DOCS_CODE} flex-1 content-start`} wrap highlighted={(await highlight(script, 'bash')) ?? undefined}>{script}</CodeBlock>
        <p className="text-xs text-muted">{text.runNote}</p>
      </div>
    </div>
  )
}
