import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { INSTALL_LINE } from '../../lib/site'
import { CodeTabs } from './mdx-islands'
import { DOCS_CODE } from '../classes'

/** The four install lines, each written from the one install constant (docs-site S3, S8). */
export function installLines(line = INSTALL_LINE) {
  const packages = line.replace(/^npm i /, '')
  return [
    { manager: 'npm', line },
    { manager: 'pnpm', line: `pnpm add ${packages}` },
    { manager: 'yarn', line: `yarn add ${packages}` },
    { manager: 'bun', line: `bun add ${packages}` },
  ] as const
}

export async function PackageManagers({ locale, label }: { locale: Locale; label: string }) {
  const lines = installLines()
  const highlighted = await Promise.all(lines.map((entry) => highlight(entry.line, 'bash')))
  const tabs = lines.map((entry, index) => ({
    name: entry.manager,
    value: entry.manager,
    panel: <CodeBlock className={DOCS_CODE} {...getLabels(locale)} lang="bash" title={entry.manager} highlighted={highlighted[index] ?? undefined}>{entry.line}</CodeBlock>,
  }))
  return <CodeTabs label={label} tabs={tabs} />
}
