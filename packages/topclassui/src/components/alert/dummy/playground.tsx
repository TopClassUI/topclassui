import { Alert } from '../index.js'
import type { AlertDesignProps } from '../index.js'

/** The docs stage, with the frame's words: the Try it controls set the schema's props, and the text stays put. */
export default function Demo(props: AlertDesignProps = {}) {
  return (
    <Alert {...props} title="Your changes are saved">
      Everything on this page is up to date.
    </Alert>
  )
}
