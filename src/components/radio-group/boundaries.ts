/** R-8.3-6: the bounds only. A hundred radios is past any choice a reader can weigh at once: a guard rail,
 * not a validator. RadioGroupSkeleton clamps its count of items to here (R-5.7-7). */
export const RADIO_GROUP_BOUNDARIES = {
  skeletonItemsMin: 1,
  skeletonItemsMax: 100,
} as const
