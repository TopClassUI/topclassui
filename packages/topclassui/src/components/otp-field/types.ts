import type { OTPField as Base } from '@base-ui/react/otp-field'
import type { Ref } from 'react'

import type { OtpFieldSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type OtpFieldDesignProps = {
  [K in keyof OtpFieldSchemaInput]?: OtpFieldSchemaInput[K] | undefined
}

/** R-5.6-1: the first cell is named by a `<label htmlFor>` on the `id`, or by `aria-labelledby`. Base UI drops an
 * `aria-label` on that cell on purpose, so none is offered: the type refuses one. */
export type OtpFieldName =
  | {
    /** The id of the first cell, which a `<label htmlFor>` points at; the others are `<id>-2`, `<id>-3`. */
    id: string
    'aria-labelledby'?: string | undefined
    /** Refused: Base UI drops it on the first cell. Name the field by `id` or `aria-labelledby`. */
    'aria-label'?: undefined
  }
  | {
    id?: string | undefined
    /** The id of the visible text that names the first cell. */
    'aria-labelledby': string
    'aria-label'?: undefined
  }

/** The name, the hint and the error mark go on the cells, never on the group; `length` is ours, clamped. */
type Owned = 'className' | 'ref' | 'length' | 'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'

// R-5.7-5: derived at the seam, so every other Base UI prop passes through untouched.
export type OtpFieldProps = Omit<Base.Root.Props, Owned>
  & OtpFieldDesignProps
  & {
    /** Merged last, so a consumer class wins a conflict with the group's own. */
    className?: string | undefined
    /** The `<div role="group">` around the cells. */
    ref?: Ref<HTMLDivElement> | undefined
    /** On the first cell, beside its name: the id of a hint or an error text. */
    'aria-describedby'?: string | undefined
    /** On every cell; `invalid` sets it to true, and when `invalid` is off a Field's own value survives. */
    'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined
  }
  & OtpFieldName

/** The export is `OTPField`; the README generator looks up `${meta.name}Props`, and meta.name is `OtpField`. */
export type OTPFieldProps = OtpFieldProps

/** What the hook holds and decides: the value, its handlers, the submit, the root, and how Base UI filters a character. */
export type OtpFieldValueProps = Pick<Base.Root.Props, 'value' | 'defaultValue' | 'onValueChange' | 'onValueComplete' | 'autoSubmit' | 'validationType' | 'normalizeValue' | 'inputMode'> & {
  length: number
  groupSize: number
  ref?: Ref<HTMLDivElement> | undefined
}

/** What Base UI hands a change handler: the reason, the event, and cancel(). */
export type OtpFieldChangeDetails = Base.Root.ChangeEventDetails

/** What Base UI hands onValueComplete: the reason and the event. */
export type OtpFieldCompleteDetails = Base.Root.CompleteEventDetails

/** Which characters Base UI keeps; `numeric` is ours, so Arabic-Indic and Persian digits count (choice 21). */
export type OtpFieldValidationType = Base.Root.ValidationType

/** One cell as the part draws it: the name of a cell after the first, and whether a separator follows it. */
export interface OtpFieldCell {
  label: string | undefined
  separator: boolean
}
