/** R-8.3-6: the bounds only. A quadrillion either way, the guard rail NumberField and Slider use for their
 * `min` and `max`: past any real reading, and it stops a stray 1e308 before it reaches ARIA or the bar. */
export const METER_BOUNDARIES = {
  limitMin: -1e15,
  limitMax: 1e15,
} as const
