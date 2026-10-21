import type { SeparatorDesignProps } from '../index.js'
import { Separator } from '../index.js'

/** The pair's box: a column of lines, or the row a vertical pair stretches to. */
const box = { horizontal: 'flex w-75 flex-col gap-4', vertical: 'flex h-10 gap-4' } as const

/** The docs stage: the Try it controls hand their values in as props. A plain line over an "or" line, as Figma 137:815 draws it. */
export default function Demo(props: SeparatorDesignProps) {
  return (
    <div className={box[props.orientation ?? 'horizontal']}>
      <Separator {...props} />
      <Separator {...props}>or</Separator>
    </div>
  )
}
