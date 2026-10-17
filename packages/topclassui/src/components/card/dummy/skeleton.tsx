import { CardBody, CardHeader, CardRoot, CardSkeleton } from '../index.js'

/** The skeleton at its default 5:2, then one given h-36 above a real card of that height. */
export default function Demo() {
  return (
    <div className="flex max-w-xs flex-col gap-4">
      <CardSkeleton />
      <CardSkeleton className="h-36" />
      <CardRoot className="h-36">
        <CardHeader>
          <h2>Storage</h2>
        </CardHeader>
        <CardBody>You have used 18 GB of the 50 GB in your plan.</CardBody>
      </CardRoot>
    </div>
  )
}
