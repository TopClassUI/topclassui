import type { Select as Base } from '@base-ui/react/select'
import type { Ref } from 'react'

import type { CollectionProps } from '#shared/contracts/collection.js'
import type { ControlName } from '#shared/contracts/name.js'
import type { ListOption } from '#shared/contracts/option.js'
import type { SELECT_PLACEMENTS } from './constants.js'
import type { SelectSchemaInput } from './schema.js'

export type SelectPlacement = (typeof SELECT_PLACEMENTS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SelectDesignProps = {
  [K in keyof SelectSchemaInput]?: SelectSchemaInput[K] | undefined
}

/** R-5.6-1: `id` for a `<label htmlFor>`, which the root hands the trigger, or one of the two ARIA names. */
export type SelectName = ControlName

/** Base UI's root, pinned to one string: a form only ever receives one, and left alone the value is `any`. */
type BaseRoot = Base.Root.Props<string>

/** R-8.5-1: the part of the shared contract a Select takes. No getKey: an option's key is its value. */
type SelectCollection = Pick<CollectionProps<ListOption>, 'hasMore' | 'loadMore'>

/** A value is a string, so none of the object helpers; one value, so no `multiple`; the options are data, not children. */
type RootRemoved = 'className' | 'multiple' | 'itemToStringLabel' | 'itemToStringValue' | 'isItemEqualToValue' | 'children' | 'items'

/** The trigger's own props, less every name the root owns and what is fixed here. Its `value` would refuse `value={null}`. */
type TriggerRest = Omit<
  Base.Trigger.Props,
  keyof BaseRoot | 'className' | 'type' | 'render' | 'nativeButton' | 'ref' | 'aria-label' | 'aria-labelledby'
>

// R-5.7-5: derived at the seam. The root's props drive the state; everything else reaches the trigger.
export type SelectProps = Omit<BaseRoot, RootRemoved>
  & TriggerRest
  & SelectDesignProps
  & SelectCollection
  & {
    /** Plain data, so a Server Component can render a Select: one option per row, in order. */
    items: readonly ListOption[]
    /** The text of an empty trigger. Left out, the provider's `select.placeholder`. */
    placeholder?: string | undefined
    /** Where the list mounts; `<body>` by default. */
    container?: Base.Portal.Props['container']
    /** On the trigger, merged last, so a consumer class wins a conflict with its own. */
    className?: string | undefined
    /** The trigger, a `<button role="combobox">`. */
    ref?: Ref<HTMLButtonElement> | undefined
  }
  & SelectName

/** What Base UI hands a change handler, of the value or of the open state: the reason, the event, and cancel(). */
export type SelectChangeDetails = Base.Root.ChangeEventDetails

/** The props the hook reads: the state, its default, the two handlers, the hidden input, the row count and the names. */
export type SelectStateProps = Pick<
  SelectProps,
  'value' | 'defaultValue' | 'onValueChange' | 'onOpenChange' | 'inputRef' | 'visibleRows' | 'placeholder' | 'ref' | 'aria-label' | 'aria-labelledby'
  | 'items' | 'hasMore' | 'loadMore' | 'loadMoreThreshold'
>
