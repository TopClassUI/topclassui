import { CardBody, CardHeader, CardRoot } from '../index.js'

/** The first drawing: a title and a line of text, with nothing to press. */
export default function Demo() {
  return (
    <div className="max-w-xs">
      <CardRoot>
        <CardHeader>
          <h2>Storage</h2>
        </CardHeader>
        <CardBody>You have used 18 GB of the 50 GB in your plan.</CardBody>
      </CardRoot>
    </div>
  )
}
