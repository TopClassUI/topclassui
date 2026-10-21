// A guide page's code block (docs-site S3): CodeBlock names the region from its header, and the frame lays a worded Copy button over that header.
import type { ReactNode } from 'react'
import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { labelsFor } from '../../labels/index'
import { CODE_FRAME, DOCS_CODE } from '../classes'
import { CopyButton } from './mdx-islands'

export interface CodeFrameProps {
  /** The code as shown. */
  code: string
  locale: Locale
  /** The header's name: a file name, a language or "code". It names the region and the Copy button. */
  title: string
  /** Read after a title the page shows again, so the regions and the buttons are told apart: ", version 2". */
  repeat?: string | undefined
  lang?: string | undefined
  highlighted?: ReactNode
  /** What Copy puts on the clipboard when it differs from what is shown; false leaves the button out. */
  copy?: string | false
  /** Long lines break instead of scrolling. */
  wrap?: boolean
  /** Added to DOCS_CODE, as WrongRight's tone edge is. */
  className?: string | undefined
}

export function CodeFrame({ code, locale, title, repeat, lang, highlighted, copy = code, wrap = false, className }: CodeFrameProps) {
  const library = getLabels(locale)
  const { common } = library.labels
  const word = labelsFor(locale).blocks.copy
  const shown = repeat === undefined ? title : <>{title}<span className="sr-only">{repeat}</span></>
  const block = (
    <CodeBlock {...library} lang={lang} title={shown} highlighted={highlighted ?? undefined} showCopy={false} wrap={wrap} className={className === undefined ? DOCS_CODE : `${DOCS_CODE} ${className}`}>
      {code}
    </CodeBlock>
  )
  if (copy === false) return block
  return (
    <div className={CODE_FRAME}>
      <CopyButton code={copy} label={`${word} ${title}${repeat ?? ''}`} text={word} copied={common.copied} failed={common.copyFailed} />
      {block}
    </div>
  )
}
