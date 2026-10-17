import { monitor } from '#icons/data/monitor.js'
import { moon } from '#icons/data/moon.js'
import { sun } from '#icons/data/sun.js'
import { Svg } from '#components/svg/index.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** The theme switcher of the docs: an icon before each label. The icon is decoration; the label names the segment. */
export default function Demo() {
  return (
    <SegmentedControlRoot aria-label="Theme" defaultValue="light">
      <SegmentedControlItem value="light" icon={<Svg icon={sun} />}>Light</SegmentedControlItem>
      <SegmentedControlItem value="dark" icon={<Svg icon={moon} />}>Dark</SegmentedControlItem>
      <SegmentedControlItem value="system" icon={<Svg icon={monitor} />}>System</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}
