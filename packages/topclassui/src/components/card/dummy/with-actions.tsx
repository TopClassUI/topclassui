import { Button } from '#components/button/index.js'
import { CardBody, CardFooter, CardHeader, CardRoot } from '../index.js'

/** The second drawing: a solid and an outline small button in the footer. */
export default function Demo() {
  return (
    <div className="max-w-xs">
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
    </div>
  )
}
