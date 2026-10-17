import { BANNER_STORAGE_PREFIX } from './constants.js'

/** The localStorage key a banner's dismissal is kept under. */
export const keyOf = (id: string): string => `${BANNER_STORAGE_PREFIX}${id}`
