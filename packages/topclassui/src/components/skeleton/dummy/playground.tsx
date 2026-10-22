import type { SkeletonDesignProps } from '../index.js'
import { Skeleton } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. Lines of text stand beside a circle, as Figma 137:916 draws them; the width is the stage's own, since a centred stage gives a full-width shape none. */
export default function Demo(props: SkeletonDesignProps) {
  return (
    <div className="flex w-70 max-w-full items-center gap-4 text-[0.8333rem]/[1.125rem]">
      {(props.variant ?? 'text') === 'text' && <Skeleton variant="circle" className="size-11" />}
      <Skeleton {...props} />
    </div>
  )
}
