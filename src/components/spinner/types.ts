import type { SvgProps } from '#components/svg/types.js'
import type { Tone } from '#shared/contracts/tone.js'
import type { Labels } from '#shared/labels/types.js'
import type { SpinnerSchemaInput } from './schema.js'

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type SpinnerTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SpinnerDesignProps = {
  [K in keyof SpinnerSchemaInput]?: SpinnerSchemaInput[K] | undefined
}

/** The glyph, the direction and the role are Spinner's own; `size` is its design prop. */
type OwnedBySpinner = 'icon' | 'size' | 'label' | 'flipRtl' | 'role'

export interface SpinnerProps extends Omit<SvgProps, OwnedBySpinner>, SpinnerDesignProps {
  /** The built-in strings; the accessible name is `labels.common.loading`. Defaults to English. */
  labels?: Labels | undefined
}
