import { Alert } from '../index.js'

/** The docs stage as the frame draws it: an info and a success alert, 340 px wide, stacked 10 px apart. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-2.5">
      <Alert tone="info" title="Your changes are saved" className="w-85">Everything on this page is up to date.</Alert>
      <Alert tone="success" title="Your changes are saved" className="w-85">Everything on this page is up to date.</Alert>
    </div>
  )
}
