import { clamp } from '#shared/clamp.js'
import { AVATAR_GROUP_BOUNDARIES } from './boundaries.js'

/** R-5.7-7: the first `max` items after the clamp, and how many the counter stands for.
 * slice drops a fraction itself, so max={2.5} shows two. */
export function splitOverflow<T>(items: readonly T[], max: number): { visible: T[]; hidden: number } {
  const limit = clamp(max, AVATAR_GROUP_BOUNDARIES.maxMin, AVATAR_GROUP_BOUNDARIES.maxMax)
  const visible = items.slice(0, limit)
  return { visible, hidden: items.length - visible.length }
}
