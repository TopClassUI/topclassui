import { bell } from '#icons/data/bell.js'
import { Svg } from '#components/svg/index.js'
import { Alert } from '../index.js'

/** The first replaces the tone's icon with the caller's own; the second has none at all. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert icon={<Svg icon={bell} size="xs" className="mt-0.5" />} title="Reminders are on">
        You will hear about every comment on this page.
      </Alert>
      <Alert icon={null} tone="neutral" title="No icon">
        The text carries the meaning on its own.
      </Alert>
    </div>
  )
}
