import { STEPPER_STATUSES } from './constants.js'
import type { StepperItem, StepperStatus } from './types.js'

/** A JS caller can pass a status no list holds, an Object.prototype name included. */
const isStatus = (status: unknown): status is StepperStatus =>
  (STEPPER_STATUSES as readonly unknown[]).includes(status)

/** Each step's status: its own when it has one, else done before the step `value` names,
 * current on it and todo after it. A `value` no step has leaves every step todo. */
export function statusOf(items: readonly StepperItem[], value: string | undefined): StepperStatus[] {
  const at = items.findIndex((item) => item.id === value)
  return items.map((item, index) => {
    if (isStatus(item.status)) return item.status
    if (at === -1 || index > at) return 'todo'
    return index < at ? 'done' : 'current'
  })
}
