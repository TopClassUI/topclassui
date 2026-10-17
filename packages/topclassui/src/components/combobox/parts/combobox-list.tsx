'use client'

import { Combobox as Base } from '@base-ui/react/combobox'

import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { COMBOBOX_ITEM, COMBOBOX_ITEM_TEXT, COMBOBOX_ITEM_TICK, COMBOBOX_LIST } from '../classes.js'
import { useComboboxList } from '../hook.js'
import type { ComboboxListProps } from '../types.js'

/** The listbox, which mounts with the popup: only the rows the window holds, each with its index, so Base UI's
 * highlight and aria-activedescendant reach a row that is not mounted. Two pseudo-elements stand for the rest. */
export function ComboboxList(props: ComboboxListProps) {
  const list = useComboboxList(props)
  return (
    <Base.List ref={list.listRef} style={list.style} className={COMBOBOX_LIST}>
      {list.rows.map((row) => (
        <Base.Item
          key={row.key}
          index={row.index}
          value={row.item.value}
          disabled={row.item.disabled}
          data-row={row.index}
          aria-setsize={list.total}
          aria-posinset={row.index + 1}
          className={COMBOBOX_ITEM}
        >
          <span className={COMBOBOX_ITEM_TEXT}>{row.item.label}</span>
          <Base.ItemIndicator className={COMBOBOX_ITEM_TICK}>
            <Svg icon={check} size="0.875rem" />
          </Base.ItemIndicator>
        </Base.Item>
      ))}
    </Base.List>
  )
}
