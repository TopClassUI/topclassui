// No 'use client': a client bundle gets it only when a client file imports it.
import { check } from '#icons/data/check.js'
import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { createNumberFormat } from '#shared/labels/get-labels.js'
import {
  STEPPER_CONNECTOR, STEPPER_MARK, STEPPER_MARK_ROW, STEPPER_MARK_SIZE, STEPPER_MARK_STATUS, STEPPER_ROOT,
  STEPPER_ROOT_SIZE, STEPPER_STATUS_TEXT, STEPPER_STEP, STEPPER_TITLE, STEPPER_TITLE_SIZE, STEPPER_TITLE_STATUS,
} from './classes.js'
import { STEPPER_DEFAULTS } from './constants.js'
import { statusOf } from './lib.js'
import type { StepperProps } from './types.js'

/** The steps of a task as an ordered list, which already says "2 of 4"; `aria-current`
 * names the current step and a hidden word says each other step's status. Nothing takes focus. */
export function Stepper({
  items,
  value = items[0]?.id,
  size = STEPPER_DEFAULTS.size,
  labels = en,
  locale = STEPPER_DEFAULTS.locale,
  className,
  ...rest
}: StepperProps) {
  if (items.length === 0) return null
  const statuses = statusOf(items, value)
  const numbers = createNumberFormat(locale)
  const last = items.length - 1

  return (
    <ol
      data-size={size}
      className={cn(STEPPER_ROOT, STEPPER_ROOT_SIZE[size], className)}
      {...rest}
      // After the rest: with list-style none, Safari with VoiceOver drops the list unless the role is written.
      role="list"
    >
      {items.map((item, index) => {
        const status = statuses[index] ?? 'todo'
        return (
          <li
            key={item.id}
            data-status={status}
            // The step value names is where the user is, whatever status it carries: an error being fixed is current too.
            aria-current={item.id === value || status === 'current' ? 'step' : undefined}
            className={STEPPER_STEP}
          >
            <div className={STEPPER_MARK_ROW}>
              {index === last
                ? null
                : <span aria-hidden="true" data-done={status === 'done' ? '' : undefined} className={STEPPER_CONNECTOR} />}
              <span aria-hidden="true" className={cn(STEPPER_MARK, STEPPER_MARK_SIZE[size], STEPPER_MARK_STATUS[status])}>
                {status === 'done' ? <Svg icon={check} size="55%" /> : null}
                {status === 'error' ? <Svg icon={x} size="55%" /> : null}
                {status === 'current' || status === 'todo' ? numbers.format(index + 1) : null}
              </span>
            </div>
            <span dir="auto" className={cn(STEPPER_TITLE, STEPPER_TITLE_SIZE[size], STEPPER_TITLE_STATUS[status])}>
              {item.title}
            </span>
            {status === 'current' ? null : <span className={STEPPER_STATUS_TEXT}>{labels.stepper[status]}</span>}
          </li>
        )
      })}
    </ol>
  )
}

export type { StepperDesignProps, StepperItem, StepperProps, StepperStatus } from './types.js'
