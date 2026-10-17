import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '../index.js'

const LONG = 'Save this document and continue to the next step of the wizard'

export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Button>{LONG}</Button>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Button variant="outline" tone="danger">
          <Svg icon={check} />
          {LONG}
        </Button>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Button fullWidth size="sm">{LONG}</Button>
      </div>
    </div>
  )
}
