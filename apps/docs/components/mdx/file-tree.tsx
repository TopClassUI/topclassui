import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

// The tree card the CLI frame draws: a 40 px row a file, a hairline between rows, 22 px of indent a level.
const CARD = `flex list-none flex-col divide-y divide-line overflow-hidden rounded-box bg-page ${BORDER}`
const ROW = 'flex min-w-0 items-center gap-2.5 py-2.75 pe-3.5'
const DEPTH = ['ps-3.5', 'ps-9', 'ps-14.5', 'ps-20', 'ps-25.5', 'ps-31'] as const
const KIND = { folder: 'folder', file: 'file-text', code: 'code', settings: 'file' } as const
const TONE = { folder: 'text-primary-on-soft', file: 'text-muted', code: 'text-muted', settings: 'text-muted' } as const
const NAME = 'shrink-0 font-mono text-[0.8125rem]/[1.0625rem] text-body'
const NOTE = 'min-w-0 truncate text-xs text-muted'

export interface FileTreeRow {
  name: string
  depth: 0 | 1 | 2 | 3 | 4 | 5
  kind: keyof typeof KIND
  note?: string
}

/** `<FileTree rows={[...]} />`: a folder as the frame draws it, one row a file with its note. */
export function FileTree({ rows }: { rows: readonly FileTreeRow[] }) {
  return (
    <ul dir="ltr" className={CARD}>
      {rows.map((row, index) => (
        <li key={index} className={`${ROW} ${DEPTH[row.depth]}`}>
          <Icon name={KIND[row.kind]} size="0.9375rem" aria-hidden="true" className={`shrink-0 ${TONE[row.kind]}`} />
          <span className={NAME}>{row.name}</span>
          {row.note === undefined ? null : <span dir="auto" className={NOTE}>{row.note}</span>}
        </li>
      ))}
    </ul>
  )
}
