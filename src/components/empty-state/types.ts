import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'

/** The native `title` is omitted: here it is the first line, and a tooltip string would collide. */
export interface EmptyStateProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title'> {
  /** Above the title. Defaults to the tray icon in the muted colour; `null` hides it. */
  icon?: ReactNode | undefined
  /** The bold first line, a paragraph and not a heading. Defaults to `labels.state.empty`; `null` hides it. */
  title?: ReactNode | undefined
  /** Defaults to `labels.state.emptyDescription` only while `title` is unset too; `null` hides it. */
  description?: ReactNode | undefined
  /** The action, which the caller passes as a Button. The component draws none of its own. */
  children?: ReactNode | undefined
  /** The built-in strings. Defaults to English; pass `getLabels(locale).labels` for another. */
  labels?: Labels | undefined
}
