import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { Labels } from '#shared/labels/types.js'
import type { TIMELINE_STATUSES } from './constants.js'

export type TimelineStatus = (typeof TIMELINE_STATUSES)[number]

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type TimelineTone = Tone

/** One event. An item may carry more fields, such as the id that `getKey` reads. */
export interface TimelineItem {
  /** What happened, in medium weight on the first line. Any node, block content included. */
  title: ReactNode
  /** When it happened, muted under the title. Pass a `<time>` for a machine-readable date. */
  time?: ReactNode | undefined
  /** The colour of the marker. Defaults to the tone of the status, then to primary. */
  tone?: TimelineTone | undefined
  /** Stands in for the dot. An element, not a name: `<Svg icon={plus} />`. */
  icon?: ReactNode | undefined
  /** Drawn as the shape of the marker and read out as hidden text from `labels.timeline`.
   * `current` is also announced as the current step. */
  status?: TimelineStatus | undefined
}

/** The root is an `<ol>` built from `items`, so it takes no children of its own, and it
 * writes its own role, so a caller cannot set one against it. */
export interface TimelineProps<T extends TimelineItem = TimelineItem>
  extends Omit<ComponentPropsWithRef<'ol'>, 'children' | 'dangerouslySetInnerHTML' | 'role'> {
  /** The events, first to last. The connector runs from each marker to the next. */
  items: readonly T[]
  /** A stable identity for each item, which becomes its React key. */
  getKey: (item: T) => string
  /** Rendered in place of the list while `items` is empty. Without it, nothing renders. */
  emptyFallback?: ReactNode | undefined
  /** The built-in strings, which name each status. Defaults to English; pass `getLabels(locale).labels` for another. */
  labels?: Labels | undefined
  /** Accepted so `{...getLabels(locale)}` spreads cleanly. Nothing here formats a number, so it is not used and never reaches the element. */
  locale?: string | undefined
}
