import { Alert } from '../index.js'

const LOG_URL = 'https://example.com/projects/topclassui/deployments/2026-10-07/logs/build-step-four-of-six.txt'

/** Two narrow boxes: the long title and description wrap, and the unbroken URL breaks anywhere. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-64">
        <Alert tone="danger" title="The deploy failed while uploading the static assets to the edge network">
          The full log is at {LOG_URL}, and it stays there for thirty days.
        </Alert>
      </div>
      <div className="w-64">
        <Alert variant="outline" tone="warning" title={LOG_URL} />
      </div>
    </div>
  )
}
