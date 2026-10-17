import type { Radio } from '@base-ui/react/radio'
import type { RadioGroup as Base } from '@base-ui/react/radio-group'
import type { CSSProperties, ReactNode, Ref } from 'react'

import type { GroupName } from '#shared/contracts/name.js'
import type { Size } from '#shared/contracts/size.js'
import type { SegmentedControlSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SegmentedControlDesignProps = {
  [K in keyof SegmentedControlSchemaInput]?: SegmentedControlSchemaInput[K] | undefined
}

/** R-5.6-1: no `<label htmlFor>` can name a group, so a caller names it one of two ways. */
export type SegmentedControlName = GroupName

/** A segmented control always has a selected segment, so it takes `value`, `defaultValue` or both. */
export type SegmentedControlSelection =
  | {
    /** The selected segment, held by its owner. */
    value: string
    defaultValue?: string | undefined
  }
  | {
    value?: string | undefined
    /** The segment selected when the page opens, and after a form reset. */
    defaultValue: string
  }

/** Base UI's group, pinned to a string: a form only ever receives one, and left alone the value is `any`. */
type BaseRoot = Base.Props<string>

// R-5.7-5: derived at the seam, so every other Base UI prop passes through untouched.
export type SegmentedControlRootProps = Omit<BaseRoot, 'className' | 'ref' | 'aria-label' | 'aria-labelledby' | 'value' | 'defaultValue'>
  & SegmentedControlDesignProps
  & {
    /** On the track, merged last, so a consumer class wins a conflict with the track's own. */
    className?: string | undefined
    /** The track, the element with role="radiogroup". */
    ref?: Ref<HTMLDivElement> | undefined
  }
  & SegmentedControlName
  & SegmentedControlSelection

/** A segment is always a native button; it draws its own label. */
type OwnedItem = 'className' | 'style' | 'nativeButton' | 'render' | 'ref' | 'value'

export type SegmentedControlItemProps = Omit<Radio.Root.Props<string>, OwnedItem> & {
  /** The string the form receives, and what `value` and `onValueChange` of the root carry. */
  value: string
  /** Drawn before the label, at the size of its own. Decoration: the label names the segment. */
  icon?: ReactNode | undefined
  /** Merged last, so a consumer class wins a conflict with the segment's own. */
  className?: string | undefined
  style?: CSSProperties | undefined
  /** The segment itself, which is a `<button>`. */
  ref?: Ref<HTMLButtonElement> | undefined
}

/** What the root shares with its segments: the size, and the value the page opens on, which keeps one tab stop in the server HTML. */
export interface SegmentedControlLook {
  size: Size
  opensOn: string | null
}

/** What the hook reads: the state, its default, the handler and the track, and the segments that take the server tab stop. */
export type SegmentedControlValueProps = Pick<BaseRoot, 'value' | 'defaultValue' | 'onValueChange' | 'children' | 'disabled'> & {
  ref?: Ref<HTMLDivElement> | undefined
}

/** What Base UI hands a change handler: the reason, the event, and cancel(). */
export type SegmentedControlChangeDetails = Base.ChangeEventDetails
