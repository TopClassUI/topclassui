import Link from 'next/link'
import { CardBody, CardHeader, CardRoot } from 'topclassui/card'
import { CodeBlock } from 'topclassui/code-block'
import { Icon } from 'topclassui/icon'
import { getLabels } from 'topclassui/labels/get-labels'

import { hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { highlight } from '../../lib/highlight'
import { INSTALL_LINE } from '../../lib/site'
import { TEXT_LINK } from '../classes'

const IMPORT_LINE = "import { Button } from 'topclassui/button'"
const IMPORT_FILE = 'page.tsx'
const MANAGER = 'npm'

/** One card, "Import from the package", until the CLI ships (choice 11). */
export async function InstallCard({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.install
  const library = getLabels(locale)
  const installation = pageBySlug('installation')
  return (
    <CardRoot className="max-w-2xl">
      <CardHeader>
        <h3 className="flex items-center gap-2 text-xl font-semibold text-body"><Icon name="download-simple" />{text.card}</h3>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-3">
          <CodeBlock {...library} lang="tsx" title={IMPORT_FILE} highlighted={(await highlight(IMPORT_LINE, 'tsx')) ?? undefined}>{IMPORT_LINE}</CodeBlock>
          <p className="text-sm text-muted">{text.note}</p>
          <p className="text-sm font-semibold text-body">
            {installation === undefined ? text.once : <Link href={hrefOf(installation, locale)} className={TEXT_LINK}>{text.once}</Link>}
          </p>
          <CodeBlock {...library} lang="bash" title={MANAGER} highlighted={(await highlight(INSTALL_LINE, 'bash')) ?? undefined}>{INSTALL_LINE}</CodeBlock>
        </div>
      </CardBody>
    </CardRoot>
  )
}
