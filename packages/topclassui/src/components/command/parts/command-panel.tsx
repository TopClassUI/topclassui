'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { Dialog } from '@base-ui/react/dialog'

import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { cn } from '#shared/cn.js'
import { TEXT_MAX_LENGTH } from '#shared/contracts/boundaries.js'
import { guardEscape } from '#shared/overlay.js'
import { Kbd } from '#components/kbd/index.js'
import { Svg } from '#components/svg/index.js'
import {
  COMMAND_BACKDROP, COMMAND_ESCAPE_HINT, COMMAND_INPUT, COMMAND_LIST, COMMAND_POPUP, COMMAND_SEARCH, COMMAND_STATUS, COMMAND_TITLE,
  COMMAND_VIEWPORT,
} from '../classes.js'
import { COMMAND_ESCAPE_GUARD } from '../constants.js'
import { useCommandPanel } from '../hook.js'
import type { CommandPanelProps } from '../types.js'
import { CommandRows } from './command-rows.js'

/** Everything from Base UI, in the chunk the shell loads on the first open: a modal dialog around an
 * inline autocomplete. The list is the filtered items, which Base UI does not filter again, and the
 * autocomplete is open with the dialog, so the input is a combobox over a listbox. */
export function CommandPanel(props: CommandPanelProps) {
  const {
    items, getKey, getLabel, getGroup, renderItem, onSelect, visibleRows, virtualize, status, emptyFallback,
    loadingFallback, hasMore, loadMore, loadMoreThreshold, onQueryChange, open, onOpenChange, container, keepMounted,
    className, ...rest
  } = props
  const panel = useCommandPanel(props)
  return (
    <Dialog.Root
      open={panel.open}
      onOpenChange={guardEscape(panel.onDialogOpenChange, COMMAND_ESCAPE_GUARD)}
      onOpenChangeComplete={panel.onOpenChangeComplete}
    >
      <Dialog.Portal container={container} keepMounted={keepMounted}>
        <Dialog.Backdrop className={COMMAND_BACKDROP} />
        <Dialog.Viewport dir={panel.dir} lang={panel.lang} className={COMMAND_VIEWPORT}>
          <Dialog.Popup {...rest} className={cn(COMMAND_POPUP, className)}>
            <Dialog.Title className={COMMAND_TITLE}>{panel.labels.title}</Dialog.Title>
            <Autocomplete.Root
              inline
              open={panel.open}
              items={panel.base}
              filteredItems={panel.base}
              autoHighlight
              virtualized={panel.virtualized}
              value={panel.query}
              onValueChange={panel.onValueChange}
              onItemHighlighted={panel.onItemHighlighted}
              itemToStringValue={getLabel}
            >
              <div className={COMMAND_SEARCH}>
                <Svg icon={magnifyingGlass} />
                <Autocomplete.Input
                  aria-label={panel.labels.placeholder}
                  placeholder={panel.labels.placeholder}
                  maxLength={TEXT_MAX_LENGTH.search}
                  className={COMMAND_INPUT}
                />
                <Kbd aria-hidden className={COMMAND_ESCAPE_HINT}>{panel.labels.escape}</Kbd>
              </div>
              <Autocomplete.List
                ref={panel.listRef}
                aria-busy={panel.busy || undefined}
                style={{ '--tc-list-rows': panel.rows, '--tc-command-enter': panel.enterHint }}
                className={COMMAND_LIST}
              >
                <CommandRows
                  runs={panel.runs}
                  total={panel.total}
                  getLabel={getLabel}
                  renderItem={renderItem}
                  select={panel.select}
                />
              </Autocomplete.List>
              <Autocomplete.Empty className={COMMAND_STATUS}>
                {status === 'loading' ? (loadingFallback ?? panel.labels.loading) : (emptyFallback ?? panel.labels.empty)}
              </Autocomplete.Empty>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
