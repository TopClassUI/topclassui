import { Spinner } from '../index.js'
import type { SpinnerDesignProps } from '../index.js'

/** The docs stage: the Try it controls set the size and the tone. */
export default function Demo(props: SpinnerDesignProps = {}) {
  return <Spinner {...props} />
}
