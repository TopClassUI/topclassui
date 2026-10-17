import { clamp } from '#shared/clamp.js'
import { ACCORDION_BOUNDARIES } from './boundaries.js'
import { ACCORDION_HEADINGS } from './constants.js'
import type { AccordionHeading, AccordionHeadingLevel } from './types.js'

const { headingLevelMin, headingLevelMax } = ACCORDION_BOUNDARIES

/** The heading tag for a level: rounded, then held to the bounds, so 9 is an h6 and 1 an h2. */
export function headingFor(level: number): AccordionHeading {
  // clamp() answers a whole number inside the bounds, and the five of them are the keys.
  return ACCORDION_HEADINGS[clamp(Math.round(level), headingLevelMin, headingLevelMax) as AccordionHeadingLevel]
}
