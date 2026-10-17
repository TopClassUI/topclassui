import { CardBody, CardHeader, CardRoot } from '../index.js'

/** CardBody is a block, so the caller spaces several paragraphs, here with space-y-2. */
export default function Demo() {
  return (
    <div className="max-w-sm">
      <CardRoot>
        <CardHeader>
          <h2>Before you migrate</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          <p>Export your projects first. The archive keeps every file and its history.</p>
          <p>Invitations that are still pending do not move, so send them again afterwards.</p>
        </CardBody>
      </CardRoot>
    </div>
  )
}
