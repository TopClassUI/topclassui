'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { Fragment } from 'react'

import { LABEL } from '#shared/classes.js'
import { COMMAND_GROUP_LABEL, COMMAND_ITEM, COMMAND_SPACER } from '../classes.js'
import type { CommandRowsProps } from '../types.js'

/** The mounted rows, each run of one group in a group element named by its heading, between the
 * spacers that stand for the rows windowing left out. A run whose heading has scrolled away keeps
 * the heading's name as its own label, so a reader still hears which group a row is in. */
export function CommandRows({ runs, before, after, getLabel, renderItem, select }: CommandRowsProps) {
  return (
    <>
      {before > 0 ? <div role="presentation" aria-hidden className={COMMAND_SPACER} style={{ '--tc-list-rows': before }} /> : null}
      {runs.map((run) => {
        const items = run.items.map((entry) => (
          <Autocomplete.Item
            key={entry.key}
            value={entry.item}
            index={entry.index}
            data-command-row={entry.row}
            onClick={() => { select(entry.item) }}
            className={COMMAND_ITEM}
          >
            {renderItem ? renderItem(entry.item) : <span className={LABEL}>{getLabel(entry.item)}</span>}
          </Autocomplete.Item>
        ))
        if (run.group === undefined) return <Fragment key="ungrouped">{items}</Fragment>
        return (
          <Autocomplete.Group key={`group:${run.group}`} aria-label={run.label ? undefined : run.group}>
            {run.label ? (
              <Autocomplete.GroupLabel data-command-row={run.label.row} className={COMMAND_GROUP_LABEL}>
                <span className={LABEL}>{run.group}</span>
              </Autocomplete.GroupLabel>
            ) : null}
            {items}
          </Autocomplete.Group>
        )
      })}
      {after > 0 ? <div role="presentation" aria-hidden className={COMMAND_SPACER} style={{ '--tc-list-rows': after }} /> : null}
    </>
  )
}
