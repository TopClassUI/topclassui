'use client'

import { FIELD_DEFAULTS } from './constants.js'
import { useFieldLive } from './hook.js'
import { messagesOf } from './lib.js'
import { FieldFrame } from './parts/field-frame.js'
import type { FieldLiveProps } from './types.js'

/** Field for a client file: the same server HTML, and with no `error` of its own it shows the nearest FormAction's. */
export function FieldLive({
  name, label, hint, error, id, invalid, required = FIELD_DEFAULTS.required, inline = FIELD_DEFAULTS.inline, children,
  ref, onInput, onChange, onClick, onKeyUp, ...rest
}: FieldLiveProps) {
  const live = useFieldLive({ id, name, error, ref, onInput, onChange, onClick, onKeyUp })
  const messages = messagesOf(live.error)
  return (
    <FieldFrame
      ids={live.ids} name={name} label={label} hint={hint} messages={messages}
      invalid={invalid ?? messages.length > 0} required={required} inline={inline} root={{ ...rest, ...live.root }}
    >
      {children}
    </FieldFrame>
  )
}
