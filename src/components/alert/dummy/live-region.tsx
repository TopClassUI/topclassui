import { Alert } from '../index.js'

/** An alert is page content. This one passes role="alert", so a screen reader announces it
 * when it appears after the page has loaded; one already in the first HTML is not read out. */
export default function Demo() {
  return (
    <Alert role="alert" tone="danger" title="The card was declined">
      Check the number and the expiry date, or use another card.
    </Alert>
  )
}
