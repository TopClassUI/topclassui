/** R-8.3-6: the bounds only. R-5.2-7 cuts a crumb to the box; this bounds the string
 * itself. The last crumb is often a page title, so the rail sits at 200, not Button's 100. */
export const BREADCRUMB_BOUNDARIES = {
  labelMaxLength: 200,
} as const
