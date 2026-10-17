import type { NumberField as Base } from '@base-ui/react/number-field'
import type { ClipboardEvent, Ref } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { NumberFieldSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type NumberFieldDesignProps = {
  [K in keyof NumberFieldSchemaInput]?: NumberFieldSchemaInput[K] | undefined
}

/** R-5.6-1: the field draws no text that names it. `id` reaches the visible input through Base UI's root, so a
 * `<label htmlFor>` names it; the two ARIA names go on that input too. */
export type NumberFieldName = ControlName

/** The root is our box; min, max and step come from the schema, where they are bounded. */
type Owned = 'className' | 'render' | 'ref' | 'id' | 'aria-label' | 'aria-labelledby' | 'min' | 'max' | 'step'

// R-5.7-5: derived at the seam, so every other Base UI prop passes through untouched.
export type NumberFieldProps = Omit<Base.Root.Props, Owned>
  & NumberFieldDesignProps
  & {
    /** Merged last, so a consumer class wins a conflict with the field's own. */
    className?: string | undefined
    /** The root element, the `<div>` that owns the width. */
    ref?: Ref<HTMLDivElement> | undefined
    /** Shown in the input while it is empty. */
    placeholder?: string | undefined
  }
  & NumberFieldName

/** What the hook holds and resolves: the value and its handler, the hidden input, the bounds, and the locale. */
export type NumberFieldValueProps = Pick<NumberFieldProps, 'value' | 'defaultValue' | 'onValueChange' | 'inputRef' | 'allowOutOfRange' | 'locale' | 'format'>
  & Pick<NumberFieldDesignProps, 'min' | 'max' | 'step'>

/** What Base UI hands a change handler: the reason, the event, and cancel(). */
export type NumberFieldChangeDetails = Base.Root.ChangeEventDetails

/** A paste into the visible input, named here: hook.ts writes no type argument in angle brackets. */
export type NumberFieldPasteEvent = ClipboardEvent<HTMLInputElement>
