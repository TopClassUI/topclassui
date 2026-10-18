import type { Dialog as Base } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

import type { CollectionProps } from '#shared/contracts/collection.js'
import type { Status } from '#shared/contracts/state.js'
import type { CommandSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type CommandDesignProps = {
  [K in keyof CommandSchemaInput]?: CommandSchemaInput[K] | undefined
}

/** The part of the shared collection contract the palette takes: paging on scroll and on search, no errorFallback. */
type CommandCollection<T> = Pick<CollectionProps<T>,
  'items' | 'getKey' | 'emptyFallback' | 'loadingFallback' | 'hasMore' | 'loadMore'> & {
  /** Never 'error': with no errorFallback, a failed fetch would read as No results. */
  status?: Exclude<Status, 'error'> | undefined
  /** Called with each new query, so the caller can fetch its first page from the server. */
  onQueryChange?: ((query: string) => void) | undefined
}

// R-5.7-5: the popup's own props reach Base UI's popup, with the two of the portal around it.
type CommandPopupProps = Omit<Base.Popup.Props, 'className' | 'children' | 'render' | 'onSelect'>
  & Pick<Base.Portal.Props, 'container' | 'keepMounted'>

export type CommandProps<T> = CommandCollection<T> & CommandDesignProps & CommandPopupProps & {
  /** The text a row shows and the query is matched against, word by word. */
  getLabel: (item: T) => string
  /** Called with the chosen item, by a press or by Enter; the palette has closed by then. */
  onSelect: (item: T) => void
  /** The heading a row sits under; rows with none come first, in a group with no heading. */
  getGroup?: ((item: T) => string | undefined) | undefined
  /** What a row holds in place of its label. It stays one row tall. */
  renderItem?: ((item: T) => ReactNode) | undefined
  /** Whether it is open. Use with onOpenChange when controlled. */
  open?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  /** Merged last onto the popup, so a consumer class wins a conflict with its own. */
  className?: string | undefined
}

/** What the shell keeps: the open state, which it shares with the panel, and the shortcut. */
export type CommandShellOptions = Pick<CommandProps<unknown>, 'open' | 'defaultOpen' | 'onOpenChange' | 'shortcut'>

/** The lazy panel's props: the palette's, with the open state the shell holds. */
export type CommandPanelProps = Omit<CommandProps<unknown>, keyof CommandShellOptions> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** A heading or an item, one row each: the flat list windowing counts. `row` is its place in that
 * list; `index` is an item's place among the items alone, which is Base UI's; `position` and `size`
 * are its place in its group, or in the whole list when there are no groups, and that set's size. */
export type CommandEntry =
  | { kind: 'label', key: string, row: number, group: string }
  | { kind: 'item', key: string, row: number, group: string | undefined, item: unknown, index: number, position: number, size: number }

/** The shape Base UI takes for a grouped list: the heading as its value, and its items. */
export interface CommandGroup {
  value: string | undefined
  items: readonly unknown[]
}

/** Mounted rows of one group with none missing between them, and whether its heading is among them. */
export interface CommandRun {
  group: string | undefined
  label: CommandEntry | undefined
  items: (CommandEntry & { kind: 'item' })[]
  /** The row of its first entry, and the row after its last. */
  start: number
  end: number
}

/** What the rows part draws: the runs of mounted rows, the spacers around them, and each row. */
export interface CommandRowsProps {
  runs: readonly CommandRun[]
  /** The rows of the whole list: the spacers stand for those that no run holds. */
  total: number
  getLabel: (item: unknown) => string
  renderItem?: ((item: unknown) => ReactNode) | undefined
  select: (item: unknown) => void
}

/** What Base UI hands onItemHighlighted, as far as the palette reads it. */
export interface CommandHighlight {
  reason: string
  index: number
}


/** What the shortcut reads of a keyboard event, so a test can pass a plain object. */
export interface CommandKeyPress {
  key: string
  code: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
}
