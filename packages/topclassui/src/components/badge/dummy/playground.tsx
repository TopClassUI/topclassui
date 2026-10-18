import type { BadgeDesignProps } from '../index.js'
import { Badge } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. */
export default function Demo(props: BadgeDesignProps) {
  return <Badge {...props}>Paid</Badge>
}
