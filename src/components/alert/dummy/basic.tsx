import { Alert } from '../index.js'

/** The docs sample: the tone picks the warning icon, so the message reads without colour. */
export default function Demo() {
  return (
    <Alert tone="warning" title="Your trial ends in three days">
      Deploys pause when it does. Projects stay readable, and adding a payment method turns
      deploys back on.
    </Alert>
  )
}
