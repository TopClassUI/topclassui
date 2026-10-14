/** R-8.3-6: the bounds only. A quadrillion either way is past any value a slider is dragged over, and a
 * millionth is finer than any thumb can land on: guard rails that stop a stray 1e308 or a step of 0. */
export const SLIDER_BOUNDARIES = {
  limitMin: -1e15,
  limitMax: 1e15,
  stepMin: 0.000001,
} as const
