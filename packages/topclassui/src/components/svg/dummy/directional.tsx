import { arrowRight } from '#icons/data/arrow-right.js'
import { check } from '#icons/data/check.js'
import { Svg } from '../index.js'

/** The arrow mirrors with the page, the pinned arrow and the check never do. */
export default function Demo() {
  return (
    <p className="flex gap-4">
      <Svg icon={arrowRight} size="lg" label="Next" />
      <Svg icon={arrowRight} size="lg" label="Right" flipRtl={false} />
      <Svg icon={check} size="lg" label="Done" />
    </p>
  )
}
