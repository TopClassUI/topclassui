// No 'use client': the native textarea is server HTML. Only autosize, the counter and the check load client.tsx.
import { useId } from 'react'

import { cn } from '#shared/cn.js'
import { FIELD_OWN_WIDTH, FIELD_READ_ONLY } from '#shared/classes.js'
import { resolveMaxLength } from '#shared/contracts/boundaries.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import { TEXTAREA_BOX, TEXTAREA_RESIZE, TEXTAREA_SIZE } from './classes.js'
import { TextareaField } from './client.js'
import { TEXTAREA_CAP_TYPE, TEXTAREA_DEFAULTS } from './constants.js'
import { clampCap, clampMaxRows, clampRows, estimateRows, joinIds } from './lib.js'
import type { TextareaProps } from './types.js'

/** A native textarea with the field look, which sends what is typed with no script at all. With `autosize`,
 * `showCount` or `validate` it sits in a small client holder that grows it, counts and holds it to the cap. */
export function Textarea({
  size = TEXTAREA_DEFAULTS.size,
  invalid = TEXTAREA_DEFAULTS.invalid,
  fullWidth = TEXTAREA_DEFAULTS.fullWidth,
  rows: givenRows = TEXTAREA_DEFAULTS.rows,
  maxRows: givenMaxRows = TEXTAREA_DEFAULTS.maxRows,
  autosize = TEXTAREA_DEFAULTS.autosize,
  showCount = TEXTAREA_DEFAULTS.showCount,
  validate = TEXTAREA_DEFAULTS.validate,
  maxLength,
  readOnly,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': describedBy,
  ...rest
}: TextareaProps) {
  const counterId = useId()
  const rows = clampRows(givenRows)
  const maxRows = clampMaxRows(givenMaxRows, rows)
  const cap = clampCap(resolveMaxLength(maxLength, TEXTAREA_CAP_TYPE))
  const held = autosize || showCount || validate
  const text = String(rest.value ?? rest.defaultValue ?? '')

  // The rest goes first, so the clamped rows, the resolved cap and the design attributes are never overwritten.
  const field = (
    <textarea
      {...rest}
      rows={autosize ? estimateRows(text, rows, maxRows) : rows}
      maxLength={cap ?? undefined}
      readOnly={readOnly}
      // A Field passes aria-invalid itself, so it survives when `invalid` is off.
      aria-invalid={invalid ? true : ariaInvalid}
      aria-describedby={held && cap !== null ? joinIds(describedBy, counterId) : describedBy}
      data-invalid={invalid ? '' : undefined}
      data-size={size}
      className={cn(
        TEXTAREA_BOX,
        TEXTAREA_SIZE[size],
        TEXTAREA_RESIZE[autosize ? 'autosize' : 'plain'],
        // In the holder the width is the holder's, so the field fills it.
        held || fullWidth ? 'w-full' : FIELD_OWN_WIDTH,
        readOnly && FIELD_READ_ONLY,
        className,
      )}
    />
  )
  if (!held) return field

  return (
    <TextareaField
      size={size}
      fullWidth={fullWidth}
      rows={rows}
      maxRows={maxRows}
      autosize={autosize}
      showCount={showCount}
      cap={cap}
      counterId={counterId}
      length={text.length}
    >
      {field}
    </TextareaField>
  )
}

export { TextareaSkeleton } from './skeleton.js'
export type { TextareaDesignProps, TextareaName, TextareaProps, TextareaSkeletonProps } from './types.js'
