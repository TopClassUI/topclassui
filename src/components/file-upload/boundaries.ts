/** R-8.3-6: the bounds only, each far above any real value, so this is a guard rail rather than a validator.
 * maxSize is in bytes: at most 10 GiB, the default as well. Both are clamped with clamp() (R-5.7-7). */
export const FILE_UPLOAD_BOUNDARIES = {
  maxFilesMin: 1,
  maxFilesMax: 100,
  maxSizeMin: 1,
  maxSizeMax: 10_737_418_240,
} as const
