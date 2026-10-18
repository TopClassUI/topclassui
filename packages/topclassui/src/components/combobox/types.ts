import type { Combobox as Base } from '@base-ui/react/combobox'
import type { ReactNode, Ref, RefObject } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { ListOption } from '#shared/contracts/option.js'
import type { COMBOBOX_PLACEMENTS, COMBOBOX_STATUSES } from './constants.js'
import type { ComboboxSchemaInput } from './schema.js'

export type ComboboxPlacement = (typeof COMBOBOX_PLACEMENTS)[number]

export type ComboboxStatus = (typeof COMBOBOX_STATUSES)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type ComboboxDesignProps = {
  [K in keyof ComboboxSchemaInput]?: ComboboxSchemaInput[K] | undefined
}

/** R-5.6-1: the id a `<label htmlFor>` points at, an `aria-label` or an `aria-labelledby`. */
export type ComboboxName = ControlName

/** Base UI's root, pinned to a string value over plain options: left alone, the value is `any`. */
type BaseRoot = Base.Root.Props<string, false, ListOption>

/** Ours to set, or not offered: one value, a windowed list, options as data. */
type RootOwned =
  | 'className' | 'multiple' | 'virtualized' | 'filteredItems' | 'grid' | 'inline' | 'limit' | 'itemToStringLabel'
  | 'itemToStringValue' | 'isItemEqualToValue' | 'children' | 'items' | 'value' | 'defaultValue' | 'onValueChange'

/** What reaches Base UI's root. Every other prop reaches the input. */
export type ComboboxRootProps = Omit<BaseRoot, RootOwned>

/** The input's own props, less those the root owns or removes (a native `multiple` too) and the native `size`, which ours replaces. */
type InputProps = Omit<
  Base.Input.Props,
  'className' | 'ref' | 'maxLength' | 'size' | 'aria-label' | 'aria-labelledby' | RootOwned | keyof ComboboxRootProps
>

// R-5.7-5: derived at the seam, so every other Base UI prop passes through untouched.
export type ComboboxProps = ComboboxRootProps & InputProps & ComboboxDesignProps & {
  /** The options, as plain data a Server Component can pass. Keep the array stable between renders. */
  items: readonly ListOption[]
  /** The chosen option's value, or null for none. Use with onValueChange when controlled. */
  value?: string | null | undefined
  /** The value the page opens on, and the one a form reset returns to. */
  defaultValue?: string | null | undefined
  /** Called with the value of the chosen option, or null when the choice is cleared. Client-only. */
  onValueChange?: ((value: string | null, details: ComboboxChangeDetails) => void) | undefined
  /** Called with no argument when the list nears its end while hasMore is set, never while closed. Client-only, or a Server Action. */
  loadMore?: (() => void | Promise<void>) | undefined
  /** What an empty list says, in place of labels.collection.noResults. */
  emptyFallback?: ReactNode | undefined
  /** Where the list mounts; the body when left out. */
  container?: Base.Portal.Props['container']
  /** Keeps the list mounted while it is closed. */
  keepMounted?: Base.Portal.Props['keepMounted']
  /** On the input, merged last. */
  className?: string | undefined
  /** The visible input. */
  ref?: Ref<HTMLInputElement> | undefined
} & ComboboxName

/** What Base UI hands a change handler: the reason, the event, and cancel(). */
export type ComboboxChangeDetails = Base.Root.ChangeEventDetails

/** What Base UI hands onItemHighlighted: the reason and the index of the row. */
export type ComboboxHighlightDetails = Base.Root.HighlightEventDetails

/** Filled by the list while it is mounted: brings a row into view by its index. */
export type ComboboxScroller = RefObject<((index: number) => void) | null>

/** What the root's hook reads. */
export type ComboboxValueProps = Pick<
  ComboboxProps,
  'items' | 'value' | 'defaultValue' | 'onValueChange' | 'onItemHighlighted' | 'inputRef' | 'maxLength' | 'visibleRows'
  | 'loadMoreThreshold' | 'status' | 'emptyFallback' | 'open' | 'defaultOpen' | 'onOpenChange' | 'ref' | 'aria-label'
  | 'aria-labelledby'
>

/** What the list part takes from the root: the scroller to fill, and the paging. */
export interface ComboboxListProps {
  scroller: ComboboxScroller
  virtualize: 'auto' | boolean
  hasMore: boolean
  /** Whether the popup is open: a list kept mounted while closed asks for nothing. */
  open: boolean
  /** How many options are loaded: one page is asked per length of items, whatever the query leaves of them. */
  loaded: number
  loadMore?: (() => void | Promise<void>) | undefined
  loadMoreThreshold: number
  /** --tc-list-rows when visibleRows was passed, or undefined so the knob applies. */
  rows: number | undefined
  /** The chosen value, whose row the list opens on. */
  selected: string | null
}
