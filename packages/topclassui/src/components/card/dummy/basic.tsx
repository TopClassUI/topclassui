import { Button } from '#components/button/index.js'
import { CardBody, CardFooter, CardHeader, CardRoot } from '../index.js'

/** The stage drawing: a title, a line of text and two extra-small buttons in the footer, Later filled as the frame draws it. */
export default function Demo() {
  return (
    <div className="w-75 max-w-full">
      <CardRoot>
        <CardHeader>
          <h2>Ship it everywhere</h2>
        </CardHeader>
        <CardBody>One design system for a browser, a phone and an Arabic page.</CardBody>
        <CardFooter>
          <Button size="xs">Read more</Button>
          <Button size="xs" variant="outline" tone="neutral" className="border-line bg-surface">Later</Button>
        </CardFooter>
      </CardRoot>
    </div>
  )
}
