import { moon } from '#icons/data/moon.js'
import { palette } from '#icons/data/palette.js'
import { sun } from '#icons/data/sun.js'
import { Svg } from '#components/svg/index.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** The colour mode switcher of the docs, as the frame's stage draws it: an icon before each label. The icon is decoration; the label names the segment. */
export default function Demo() {
  return (
    <SegmentedControlRoot aria-label="Colour mode" defaultValue="dark">
      <SegmentedControlItem value="light" icon={<Svg icon={sun} />}>Light</SegmentedControlItem>
      <SegmentedControlItem value="dark" icon={<Svg icon={moon} />}>Dark</SegmentedControlItem>
      <SegmentedControlItem value="ocean" icon={<Svg icon={palette} />}>Ocean</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}
