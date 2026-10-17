/** R-8.3-6: the bounds only. An h1 is the page's own title and HTML has no h7, so these two
 * are the whole range a heading inside a page can take; a hundred items is a guard rail. Each is clamped (R-5.7-7). */
export const ACCORDION_BOUNDARIES = {
  headingLevelMin: 2,
  headingLevelMax: 6,
  skeletonItemsMin: 1,
  skeletonItemsMax: 100,
} as const
