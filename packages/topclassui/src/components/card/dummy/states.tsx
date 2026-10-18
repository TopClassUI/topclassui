import { Button } from '#components/button/index.js'
import { CardBody, CardFooter, CardHeader, CardRoot, CardSkeleton } from '../index.js'

/** Each state with its name under it. A card is a surface, not a control: it has no hover or focus of its own. */
export default function Demo() {
  return (
    <div className="grid max-w-xs gap-6 text-sm text-muted">
      <div className="grid gap-2">
        <CardRoot>
          <CardHeader>
            <h2>Storage</h2>
          </CardHeader>
          <CardBody>You have used 18 GB of the 50 GB in your plan.</CardBody>
        </CardRoot>
        <span>Idle</span>
      </div>
      <div className="grid gap-2">
        <CardRoot>
          <CardHeader>
            <h2>Version 0.4</h2>
          </CardHeader>
          <CardBody>Card is now CardRoot. Find and replace; nothing else changed.</CardBody>
          <CardFooter>
            <Button size="sm">Read more</Button>
            <Button size="sm" variant="outline" tone="neutral">Later</Button>
          </CardFooter>
        </CardRoot>
        <span>With actions</span>
      </div>
      <div className="grid gap-2">
        <CardSkeleton />
        <span>Loading</span>
      </div>
    </div>
  )
}
