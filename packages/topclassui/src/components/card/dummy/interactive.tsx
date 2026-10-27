import { CardBody, CardHeader, CardRoot } from '../index.js'

/** The whole card is one link: it steps down to the surface on hover and shows the ring on focus. */
export default function Demo() {
  return (
    <div className="max-w-xs">
      <CardRoot render={<a href="#report" />}>
        <CardHeader>
          <h2>Monthly report</h2>
        </CardHeader>
        <CardBody>Revenue rose 12% against April, driven by renewals.</CardBody>
      </CardRoot>
    </div>
  )
}
