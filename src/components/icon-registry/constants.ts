// R-5.12-4: the registry's data constants, kept out of index.tsx.
import type { IconData } from '#icons/types.js'

/** An empty path renders an empty svg at the resolved size, holding the layout. */
export const MISSING: IconData = { viewBox: '0 0 256 256', path: '', directional: false }
