/** R-8.3-6: the bounds only. The bar cuts a brand to its box and scrolls its links; this bounds
 * the string itself. The longest label a demo shows is 21 characters, so 100 is a guard rail; so are fifty links. */
export const NAVBAR_BOUNDARIES = {
  labelMaxLength: 100,
  skeletonLinksMin: 1,
  skeletonLinksMax: 50,
} as const
