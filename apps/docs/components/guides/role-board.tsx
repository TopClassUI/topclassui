import { Children, isValidElement, type ReactNode } from 'react'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { textOf } from '../../lib/text-of'

/** Where the frame (Figma 345:11, a 944 x 570 board) puts each role's label, its leader line and the dot the line ends on. */
const SPOTS = {
  'bg-surface': { label: [455.7, 47.2, 236], line: [504, 81, 472, 135] },
  'border-line': { label: [724.3, 144.9, 203.4], line: [721, 159.5, 697, 167.6] },
  'text-body': { label: [16.3, 198.6, 218], line: [237.6, 213, 289.7, 221.4] },
  'text-muted': { label: [16.3, 262, 218], line: [237.6, 276.7, 289.7, 244.1] },
  'bg-primary-solid': { label: [16.3, 335.3, 218], line: [237.6, 350, 289.7, 296.2] },
  'bg-primary-soft': { label: [724.3, 249, 203.4], line: [721, 263.7, 660.8, 282.4] },
  'bg-surface-raised': { label: [724.3, 345, 203.4], line: [721, 359.7, 660.8, 352.4] },
  'bg-page': { label: [455.7, 486.6, 236], line: [520.8, 485, 569.7, 406.9] },
} as const satisfies Record<string, { label: readonly [number, number, number]; line: readonly [number, number, number, number] }>

type Role = keyof typeof SPOTS

const BOARD = { width: 944, height: 570 }

const percent = (value: number, of: number) => `${String(Math.round((value / of) * 10000) / 100)}%`

interface Item {
  role: Role
  name: string
  text: string
}

/** The board's eight roles, read from the page's list: "`bg-surface`: The top bar." becomes its name and its sentence. */
function itemsOf(children: ReactNode): Item[] {
  const items: Item[] = []
  Children.forEach(children, (list) => {
    if (!isValidElement<{ children?: ReactNode }>(list)) return
    Children.forEach(list.props.children, (entry) => {
      if (!isValidElement(entry)) return
      const line = textOf(entry).trim()
      const cut = line.indexOf(': ')
      const name = line.slice(0, cut)
      const role = name.split(' ')[0] ?? ''
      if (!(role in SPOTS)) throw new Error(`the board has no place for "${name}"`)
      items.push({ role: role as Role, name, text: line.slice(cut + 2) })
    })
  })
  return items
}

/** The drawn screen: a top bar, a card with its Save button, and the dropdown floating over it. */
function Screen({ labels }: { labels: ReturnType<typeof guideLabelsFor>['board'] }) {
  const [selected, ...rest] = labels.options
  return (
    <div inert className={`relative flex flex-col overflow-hidden rounded-box bg-page ${BORDER}`}>
      <div className="flex items-center border-b-(length:--tc-line-width) border-line bg-surface py-3.5 ps-4">
        <span className="text-xs font-semibold text-body">{labels.brand}</span>
      </div>
      <div className="relative px-7 pt-9 pb-30">
        <div className={`flex w-60 flex-col items-start gap-2 rounded-box bg-surface p-4 ${BORDER}`}>
          <span className="text-sm font-semibold text-body">{labels.title}</span>
          <span className="text-xs text-muted">{labels.lead}</span>
          <Button type="button" size="xs">{labels.save}</Button>
        </div>
        <div className={`absolute inset-s-[53.5%] top-24 flex w-44 flex-col gap-0.5 rounded-box bg-surface-raised p-1.5 shadow-lg ${BORDER}`}>
          <span className="rounded-control bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary-on-soft">{selected}</span>
          {rest.map((option) => <span key={option} className="px-2.5 py-1.5 text-xs text-body">{option}</span>)}
        </div>
      </div>
    </div>
  )
}

/** One screen built from real components with the class that paints each part pointed at, as the frame draws it; under lg the screen sits above the page's list (docs-site page 7). */
export function RoleBoard({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const labels = guideLabelsFor(locale).board
  const items = itemsOf(children)
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="sr-only">{labels.label}</figcaption>
      <div className="flex flex-col gap-4 lg:hidden">
        <Screen labels={labels} />
        <div className="text-sm text-body">{children}</div>
      </div>
      <div className="relative hidden aspect-[944/570] w-full lg:block">
        <div className="absolute inset-s-[25.86%] top-[21.41%] w-[48.28%]">
          <Screen labels={labels} />
        </div>
        <svg aria-hidden="true" viewBox={`0 0 ${String(BOARD.width)} ${String(BOARD.height)}`} className="absolute inset-0 size-full scale-x-(--tc-dir) text-muted">
          {items.map(({ role }) => {
            const [x1, y1, x2, y2] = SPOTS[role].line
            return (
              <g key={role}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
                <circle cx={x2} cy={y2} r="2.85" fill="currentColor" />
              </g>
            )
          })}
        </svg>
        <ul className="contents">
          {items.map(({ role, name, text }) => {
            const [x, y, width] = SPOTS[role].label
            return (
              <li
                key={role}
                style={{ '--tc-board-x': percent(x, BOARD.width), '--tc-board-y': percent(y, BOARD.height), '--tc-board-w': percent(width, BOARD.width) }}
                className="absolute inset-s-(--tc-board-x) top-(--tc-board-y) flex w-(--tc-board-w) flex-col gap-0.5 text-xs text-muted"
              >
                <code dir="ltr" className="w-fit font-sans font-semibold">{name}</code>
                <span>{text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </figure>
  )
}
