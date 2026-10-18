import { Alert } from '../index.js'
import type { AlertDesignProps } from '../index.js'

/** The docs stage: the Try it controls set the schema's props, and the text stays put. */
export default function Demo(props: AlertDesignProps = {}) {
  return (
    <Alert {...props} title="Your trial ends in three days">
      Deploys pause when it does. Adding a payment method turns them back on.
    </Alert>
  )
}
