/** R-8.3-6: the bounds only. An h1 is the page's own title and HTML has no h7, so these two
 * are the whole range a heading inside a page can take. headingLevel is clamped to them (R-5.7-7). */
export const ACCORDION_BOUNDARIES = {
  headingLevelMin: 2,
  headingLevelMax: 6,
} as const
