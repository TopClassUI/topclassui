import { Button } from '#components/button/index.js'
import { CardBody, CardFooter, CardHeader, CardRoot } from '../index.js'

/** The docs code sample, with the download as a real link that keeps the button look. */
export default function Demo() {
  return (
    <div className="max-w-xs">
      <CardRoot>
        <CardHeader>
          <h2>Monthly report</h2>
        </CardHeader>
        <CardBody>Revenue rose 12% against April, driven by renewals.</CardBody>
        <CardFooter>
          <Button render={<a href="#" />} variant="outline" size="sm">
            Download PDF
          </Button>
        </CardFooter>
      </CardRoot>
    </div>
  )
}
