'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { Fragment } from 'react'

import { LABEL } from '#shared/classes.js'
import { COMMAND_GROUP_LABEL, COMMAND_ITEM, COMMAND_SPACER } from '../classes.js'
import type { CommandRowsProps } from '../types.js'

/** The rows windowing left out between two runs, as many units tall as the rows it stands for. */
function Spacer({ rows }: { rows: number }) {
  if (rows <= 0) return null
  return <div role="presentation" aria-hidden className={COMMAND_SPACER} style={{ '--tc-list-rows': rows }} />
}

/** The mounted rows, each run of one group in a group element named by its heading, with a spacer
 * before each run and after the last for the rows windowing left out. A run whose heading is not
 * mounted keeps the heading's name as its own label, so a reader still hears which group a row is in. */
export function CommandRows({ runs, total, getLabel, renderItem, select }: CommandRowsProps) {
  const seen = new Map<string | undefined, number>()
  return (
    <>
      {runs.map((run, at) => {
        const items = run.items.map((entry) => (
          <Autocomplete.Item
            key={entry.key}
            value={entry.item}
            index={entry.index}
            data-command-row={entry.row}
            aria-setsize={entry.size}
            aria-posinset={entry.position}
            onClick={() => { select(entry.item) }}
            className={COMMAND_ITEM}
          >
            {renderItem ? renderItem(entry.item) : <span className={LABEL}>{getLabel(entry.item)}</span>}
          </Autocomplete.Item>
        ))
        // The active row kept apart from the window makes a second run of its group.
        const nth = seen.get(run.group) ?? 0
        seen.set(run.group, nth + 1)
        const key = `${run.group === undefined ? 'ungrouped' : `group:${run.group}`}:${String(nth)}`
        const gap = <Spacer rows={run.start - (runs[at - 1]?.end ?? 0)} />
        if (run.group === undefined) return <Fragment key={key}>{gap}{items}</Fragment>
        return (
          <Fragment key={key}>
            {gap}
            <Autocomplete.Group aria-label={run.label ? undefined : run.group}>
              {run.label ? (
                <Autocomplete.GroupLabel data-command-row={run.label.row} className={COMMAND_GROUP_LABEL}>
                  <span className={LABEL}>{run.group}</span>
                </Autocomplete.GroupLabel>
              ) : null}
              {items}
            </Autocomplete.Group>
          </Fragment>
        )
      })}
      <Spacer rows={total - (runs.at(-1)?.end ?? 0)} />
    </>
  )
}
