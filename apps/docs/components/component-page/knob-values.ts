// The examples' density and radius steps, read by the knobs and by the server's first render of the examples' box.

/** Three steps each; the middle one is the token's own default (tokens.css). */
export const DENSITY = { compact: '0.875', normal: '1', comfortable: '1.25' } as const
export const RADIUS = { square: '0rem', rounded: '0.5rem', pill: '9999px' } as const

export const KNOB_DEFAULTS = { density: 'normal', radius: 'rounded' } as const
