import { Alert } from '../index.js'

/** The docs stage as the frame draws it: an info and a success alert, 340 px wide or the stage's width, stacked 10 px apart. */
export default function Demo() {
  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      <Alert tone="info" title="Your changes are saved" className="w-full max-w-85">Everything on this page is up to date.</Alert>
      <Alert tone="success" title="Your changes are saved" className="w-full max-w-85">Everything on this page is up to date.</Alert>
    </div>
  )
}
