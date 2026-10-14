'use client'

import { cn } from '#shared/cn.js'
import { FIELD_OWN_WIDTH, FIELD_TEXT } from '#shared/classes.js'
import { TEXTAREA_COUNT, TEXTAREA_HOLDER } from './classes.js'
import { useTextareaField } from './hook.js'
import type { TextareaFieldProps } from './types.js'

/** The holder around the server's textarea: it never clones it and passes it nothing. It hears the
 * field through the input event, which bubbles, and holds the count under it at the inline end. */
export function TextareaField({
  size, fullWidth, rows, maxRows, autosize, showCount, cap, counterId, length, children,
}: TextareaFieldProps) {
  const field = useTextareaField({ rows, maxRows, autosize, showCount, cap, length })
  return (
    <div
      ref={field.ref}
      onInput={field.onInput}
      className={cn(TEXTAREA_HOLDER, FIELD_TEXT[size], fullWidth ? 'w-full' : FIELD_OWN_WIDTH)}
    >
      {children}
      {/* The description of the field, not a live region: it is read when the field is reached. */}
      {cap === null ? null : (
        <span
          id={counterId}
          data-at-limit={field.limit === 'at' ? '' : undefined}
          data-over-limit={field.limit === 'over' ? '' : undefined}
          className={TEXTAREA_COUNT}
        >
          {field.counted ? <span aria-hidden dir="ltr">{field.visible}</span> : null}
          {field.counted ? <span className="sr-only">{field.spoken}</span> : null}
        </span>
      )}
    </div>
  )
}
