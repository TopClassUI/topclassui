/** R-8.3-6: the bounds only, each far above any real value, so this is a guard rail rather than a validator. `min`,
 * `max` and a held value are clamped between the two limits, and a numeric `step` from `stepMin` up (R-5.7-7). */
export const NUMBER_FIELD_BOUNDARIES = {
  limitMin: -1e15,
  limitMax: 1e15,
  stepMin: 0.000001,
} as const
