'use client'

import { check } from '#icons/data/check.js'
import { copy } from '#icons/data/copy.js'
import { Svg } from '#components/svg/index.js'
import { CODE_BLOCK_COPY, CODE_BLOCK_STATUS } from './classes.js'
import { useCodeBlockCopy } from './hook.js'
import type { CodeBlockCopyProps } from './types.js'

/** The copy button of a CodeBlock, internal. Its name never changes: the tick is the cue to the
 * eye, and the status beside it says the result once, then empties so the next press is heard. */
export function CodeBlockCopy({ code, label, copied, failed, titleId }: CodeBlockCopyProps) {
  const button = useCodeBlockCopy(code)
  return (
    <>
      <button
        type="button"
        id={button.id}
        aria-label={label}
        aria-labelledby={titleId === undefined ? undefined : `${button.id} ${titleId}`}
        data-copied={button.result === 'copied' ? '' : undefined}
        className={CODE_BLOCK_COPY}
        onClick={() => { void button.copy() }}
      >
        <Svg icon={button.result === 'copied' ? check : copy} size="0.875rem" />
      </button>
      <span role="status" className={CODE_BLOCK_STATUS}>
        {button.result === 'copied' ? copied : button.result === 'failed' ? failed : ''}
      </span>
    </>
  )
}
