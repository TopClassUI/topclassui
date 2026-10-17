'use client'

import { FIELD_DEFAULTS } from './constants.js'
import { useFieldLive } from './hook.js'
import { messagesOf, renderField } from './lib.js'
import type { FieldLiveProps } from './types.js'

/** Field for a client file: the same server HTML, and with no `error` of its own it shows the nearest FormAction's. */
export function FieldLive({
  name, label, hint, error, id, invalid, required = FIELD_DEFAULTS.required, inline = FIELD_DEFAULTS.inline, children,
  ref, onInput, onChange, onClick, onKeyUp, ...rest
}: FieldLiveProps) {
  const live = useFieldLive({ id, name, error, ref, onInput, onChange, onClick, onKeyUp })
  const messages = messagesOf(live.error)
  return renderField({
    ids: live.ids, name, label, hint, messages, invalid: invalid ?? messages.length > 0, required, inline, children, root: { ...rest, ...live.root },
  })
}
