// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import {
  TIMELINE_CONNECTOR, TIMELINE_DOT, TIMELINE_DOT_HOLLOW, TIMELINE_ICON, TIMELINE_ICON_HOLLOW,
  TIMELINE_MARKER,
} from './classes.js'
import { TIMELINE_DEFAULTS, TIMELINE_STATUS_TONES } from './constants.js'
import type { TimelineItem, TimelineProps, TimelineTone } from './types.js'

/** The item's own tone, then the tone of its status, then the default. A JS caller can
 * pass a tone no list holds: it gets the default, not an unpainted marker. */
const pickTone = ({ tone, status }: TimelineItem): TimelineTone => {
  if (tone !== undefined && Object.hasOwn(TIMELINE_DOT, tone)) return tone
  return status === 'done' || status === 'current' ? TIMELINE_STATUS_TONES[status] : TIMELINE_DEFAULTS.tone
}

/** A rail of dated events. It renders what it is given, in the order given, and never
 * sorts, fetches or pages (R-8.5-2). The rail mirrors by itself in a right-to-left tree. */
export function Timeline<T extends TimelineItem = TimelineItem>({
  items,
  getKey,
  emptyFallback,
  className,
  ...rest
}: TimelineProps<T>) {
  if (items.length === 0) return emptyFallback ?? null
  const last = items.length - 1

  return (
    <ol
      className={cn('flex flex-col', className)}
      {...rest}
      // After the rest: with list-style none, Safari with VoiceOver drops the list unless the role is written.
      role="list"
    >
      {items.map((item, index) => {
        const hollow = item.status === 'todo'
        const tone = pickTone(item)
        return (
          <li
            key={getKey(item)}
            data-status={item.status}
            data-tone={hollow ? undefined : tone}
            aria-current={item.status === 'current' ? 'step' : undefined}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <span className={TIMELINE_MARKER}>
                {item.icon == null
                  ? <span className={hollow ? TIMELINE_DOT_HOLLOW : TIMELINE_DOT[tone]} />
                  : <span className={hollow ? TIMELINE_ICON_HOLLOW : TIMELINE_ICON[tone]}>{item.icon}</span>}
              </span>
              {index === last ? null : <span className={TIMELINE_CONNECTOR} />}
            </div>
            <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5 wrap-anywhere', index === last ? null : 'pb-4')}>
              <p className="text-sm font-medium text-body">{item.title}</p>
              {item.time == null ? null : <p className="text-xs text-muted">{item.time}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export type { TimelineItem, TimelineProps, TimelineStatus, TimelineTone } from './types.js'
