// No 'use client': a client bundle gets it only when a client file imports it.
import { useId } from 'react'

import { terminalWindow } from '#icons/data/terminal-window.js'
import { Svg } from '#components/svg/index.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { hasContent } from '#shared/render-trigger.js'
import {
  CODE_BLOCK_HEADER, CODE_BLOCK_ICON, CODE_BLOCK_PRE, CODE_BLOCK_PRE_ALONE, CODE_BLOCK_ROOT, CODE_BLOCK_TITLE, CODE_BLOCK_WRAP,
} from './classes.js'
import { CodeBlockCopy } from './client.js'
import { CODE_BLOCK_DEFAULTS } from './constants.js'
import type { CodeBlockProps } from './types.js'

/** Code in a box of its own, read left to right in any page. Without showCopy it renders no
 * client part, so it ships nothing to the browser; with it, one button that copies children. */
export function CodeBlock({
  children,
  lang,
  title,
  highlighted,
  showCopy = CODE_BLOCK_DEFAULTS.showCopy,
  wrap = CODE_BLOCK_DEFAULTS.wrap,
  labels = en,
  locale: _locale,
  className,
  ...rest
}: CodeBlockProps) {
  // R-5.1-1 allows useId: the title can be any node, so the region and the button are named by reference.
  const titleId = useId()
  const named = hasContent(title)
  const header = named || showCopy
  return (
    <div data-lang={lang} className={cn(CODE_BLOCK_ROOT, className)} {...rest}>
      {header ? (
        <div className={CODE_BLOCK_HEADER}>
          {named ? (
            <>
              <span aria-hidden="true" className={CODE_BLOCK_ICON}><Svg icon={terminalWindow} size="0.875rem" /></span>
              <span dir="auto" id={titleId} className={CODE_BLOCK_TITLE}>{title}</span>
            </>
          ) : null}
          {showCopy ? (
            <CodeBlockCopy
              code={children}
              label={labels.common.copy}
              copied={labels.common.copied}
              failed={labels.common.copyFailed}
              titleId={named ? titleId : undefined}
            />
          ) : null}
        </div>
      ) : null}
      <pre
        dir="ltr"
        translate="no"
        className={cn(CODE_BLOCK_PRE, header ? null : CODE_BLOCK_PRE_ALONE, wrap ? CODE_BLOCK_WRAP : null)}
        // The server cannot measure whether a line overflows, so the box is always reachable to scroll, as Table's is.
        tabIndex={wrap ? undefined : 0}
        // A tab stop with no title is still a named region, so Tab never lands on a nameless box.
        role={named || !wrap ? 'region' : undefined}
        aria-labelledby={named ? titleId : undefined}
        aria-label={named || wrap ? undefined : labels.common.code}
      >
        <code>{hasContent(highlighted) ? highlighted : children}</code>
      </pre>
    </div>
  )
}

export type { CodeBlockDesignProps, CodeBlockProps } from './types.js'
