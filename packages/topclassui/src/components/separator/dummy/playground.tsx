import type { SeparatorDesignProps } from '../index.js'
import { Separator } from '../index.js'

/** The pair's box: a column of lines, or the row a vertical pair stretches to. */
const box = { horizontal: 'flex w-75 flex-col gap-4', vertical: 'flex h-10 gap-4' } as const

/** The labelled line: inset from the plain one in a column, as Figma 137:815 draws it, with a mono label. */
const label = { horizontal: 'w-68 self-center font-mono', vertical: 'font-mono' } as const

/** The docs stage: the Try it controls hand their values in as props. A plain line over an "or" line, as Figma 137:815 draws it; withLabel takes the second away. */
export default function Demo({ withLabel = true, ...props }: SeparatorDesignProps & { withLabel?: boolean }) {
  return (
    <div className={box[props.orientation ?? 'horizontal']}>
      <Separator {...props} />
      {withLabel && <Separator {...props} className={label[props.orientation ?? 'horizontal']}>or</Separator>}
    </div>
  )
}
