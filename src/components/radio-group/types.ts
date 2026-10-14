import type { Radio } from '@base-ui/react/radio'
import type { RadioGroup as Base } from '@base-ui/react/radio-group'
import type { CSSProperties, Ref } from 'react'

import type { GroupName } from '#shared/contracts/name.js'
import type { Size } from '#shared/contracts/size.js'
import type { RADIO_GROUP_ORIENTATIONS } from './constants.js'
import type { RadioGroupSchemaInput } from './schema.js'

export type RadioGroupOrientation = (typeof RADIO_GROUP_ORIENTATIONS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type RadioGroupDesignProps = {
  [K in keyof RadioGroupSchemaInput]?: RadioGroupSchemaInput[K] | undefined
}

/** R-5.6-1: no `<label htmlFor>` can name a group, so a caller names it one of two ways. */
export type RadioGroupName = GroupName

/** Base UI's group, pinned to a string: a form only ever receives one, and left alone the value is `any`. */
type BaseRoot = Base.Props<string>

// R-5.7-5: derived at the seam, so every other Base UI prop passes through untouched.
export type RadioGroupRootProps = Omit<BaseRoot, 'className' | 'ref' | 'aria-label' | 'aria-labelledby'>
  & RadioGroupDesignProps
  & {
    /** Merged last, so a consumer class wins a conflict with the group's own. */
    className?: string | undefined
    /** The element with role="radiogroup". */
    ref?: Ref<HTMLDivElement> | undefined
  }
  & RadioGroupName

/** The radio is always a native button inside a label; the label takes the class and the style. */
type OwnedItem = 'className' | 'style' | 'nativeButton' | 'render' | 'ref' | 'value'

export type RadioGroupItemProps = Omit<Radio.Root.Props<string>, OwnedItem> & {
  /** The string the form receives, and what `value` and `onValueChange` of the group carry. */
  value: string
  /** On the `<label>` around the radio and its text, merged last. */
  className?: string | undefined
  /** On the `<label>` around the radio and its text. */
  style?: CSSProperties | undefined
  /** The radio itself, which is a `<button>`. */
  ref?: Ref<HTMLButtonElement> | undefined
}

/** What the root shares with its radios: the size, and the value the page opens on, which keeps one tab stop in the server HTML. */
export interface RadioGroupLook {
  size: Size
  opensOn: string | null
}

/** The four props the hook holds: the state, its default, the handler and the root. */
export type RadioGroupValueProps = Pick<BaseRoot, 'value' | 'defaultValue' | 'onValueChange'> & {
  ref?: Ref<HTMLDivElement> | undefined
}

/** What Base UI hands a change handler: the reason, the event, and cancel(). */
export type RadioGroupChangeDetails = Base.ChangeEventDetails
