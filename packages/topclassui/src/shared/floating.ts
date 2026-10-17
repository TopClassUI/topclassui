// R-5.3-4: one `placement` prop that mirrors, instead of Base UI's physical side.

/** `start` and `end` resolve to the inline edges, so a popup opens correctly in Arabic. */
export const PLACEMENTS = [
  'top', 'top-start', 'top-end',
  'bottom', 'bottom-start', 'bottom-end',
  'start', 'start-top', 'start-bottom',
  'end', 'end-top', 'end-bottom',
] as const

export type Placement = (typeof PLACEMENTS)[number]

export const DEFAULT_PLACEMENT = 'bottom-start' satisfies Placement

export type Side = 'top' | 'bottom' | 'inline-start' | 'inline-end'
export type Align = 'start' | 'center' | 'end'

const SIDES: Record<string, Side> = {
  top: 'top',
  bottom: 'bottom',
  start: 'inline-start',
  end: 'inline-end',
}

const ALIGNS: Record<string, Align> = {
  start: 'start',
  end: 'end',
  top: 'start',
  bottom: 'end',
}

/**
 * Base UI takes `side` plus `align`, and its logical sides already mirror with the
 * direction provider, so nothing here reads the direction itself.
 */
export function toSideAlign(placement: Placement = DEFAULT_PLACEMENT): { side: Side; align: Align } {
  const [rawSide = 'bottom', rawAlign] = placement.split('-')
  const side = SIDES[rawSide] ?? 'bottom'
  const align = rawAlign ? (ALIGNS[rawAlign] ?? 'center') : 'center'
  return { side, align }
}

/** R-10.5-1: a popup is never cut off and never taller than the viewport allows. */
export const POPUP_BOUNDS = {
  collisionPadding: 8,
  sideOffset: 6,
} as const
