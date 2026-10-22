import { Children, isValidElement, type ReactNode } from 'react'

import { BORDER } from 'topclassui/classes'

import { STEP_NUMBER } from '../classes'

// A numbered list as the docs frames draw it: one card, a row per step, the number in a soft chip, the bold lead on its own line.
const CARD = `flex list-none flex-col divide-y divide-line overflow-hidden rounded-box bg-surface ${BORDER}`
const ROW = 'flex gap-3 px-4 py-3.5'
const TITLE = 'block text-sm font-semibold text-body'
const TEXT = 'flex min-w-0 flex-col gap-1 text-sm text-muted'

/** The `<strong>` a step opens with, and the rest of the step. */
function splitStep(children: ReactNode): { lead: ReactNode; rest: ReactNode[] } {
  const parts = Children.toArray(children)
  const [first, ...rest] = parts
  if (isValidElement<{ children?: ReactNode }>(first) && first.type === 'strong') return { lead: first.props.children, rest }
  return { lead: null, rest: parts }
}

/** An MDX `ol`: each `li` becomes a numbered row. */
export function Steps({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children).filter((child) => isValidElement<{ children?: ReactNode }>(child))
  return (
    <ol className={CARD}>
      {items.map((item, index) => {
        const { lead, rest } = splitStep((item as { props: { children?: ReactNode } }).props.children)
        return (
          <li key={index} className={ROW}>
            <span aria-hidden="true" className={STEP_NUMBER}>{index + 1}</span>
            <span className={TEXT}>
              {lead === null ? null : <strong className={TITLE}>{lead}</strong>}
              <span>{rest}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
