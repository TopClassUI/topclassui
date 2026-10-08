import { command } from '#icons/data/command.js'
import { Svg } from '#components/svg/index.js'
import { Kbd } from '../index.js'

/** The docs sample: the icon takes no size, so at its 1em default it follows the key's text. */
export default function Demo() {
  return (
    <p className="text-sm text-body">
      Press <Kbd><Svg icon={command} label="Command" /></Kbd> <Kbd>K</Kbd> to open the command palette.
    </p>
  )
}
