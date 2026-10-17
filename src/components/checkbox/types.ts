import type { Checkbox as Base } from '@base-ui/react/checkbox'
import type { Ref } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { CheckboxSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type CheckboxDesignProps = {
  [K in keyof CheckboxSchemaInput]?: CheckboxSchemaInput[K] | undefined
}

/** R-5.6-1: a checkbox draws no text of its own, so a caller names it one of three ways. */
export type CheckboxName = ControlName

/** The root is always a native button with the role: a `<label htmlFor>` names it in the server HTML. */
type Owned = 'className' | 'nativeButton' | 'render' | 'ref' | 'id' | 'aria-label' | 'aria-labelledby'

// R-5.7-5: derived at the seam, so every other Base UI prop passes through untouched.
export type CheckboxProps = Omit<Base.Root.Props, Owned>
  & CheckboxDesignProps
  & {
    /** Merged last, so a consumer class wins a conflict with the checkbox's own. */
    className?: string | undefined
    /** The root element, which is a `<button>`. */
    ref?: Ref<HTMLButtonElement> | undefined
  }
  & CheckboxName

/** The four props the hook holds: the state, its default, the handler and the hidden input. */
export type CheckboxValueProps = Pick<Base.Root.Props, 'checked' | 'defaultChecked' | 'onCheckedChange' | 'inputRef'>

/** What Base UI hands a change handler: the reason, the event, and cancel(). */
export type CheckboxChangeDetails = Base.Root.ChangeEventDetails
