import { arrowRight } from '#icons/data/arrow-right.js'
import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Svg icon={check} />
        Approve
      </Button>
      <Button variant="outline">
        Next
        <Svg icon={arrowRight} />
      </Button>
    </div>
  )
}
