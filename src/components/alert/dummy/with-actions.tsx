import { Button } from '#components/button/index.js'
import { Alert } from '../index.js'

/** Actions sit on the soft variant: an unfilled Button on a solid fill fails 4.5:1. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert
        tone="warning"
        title="Your trial ends in three days"
        actions={(
          <>
            <Button size="sm" tone="warning" render={<a href="/billing" />}>Add a payment method</Button>
            <Button size="sm" variant="outline" tone="warning">Remind me later</Button>
          </>
        )}
      >
        Deploys pause when it does. Projects stay readable.
      </Alert>
      <Alert
        tone="danger"
        title="The last deploy failed"
        actions={(
          <>
            <Button size="sm" tone="danger">Retry the deploy</Button>
            <Button size="sm" variant="outline" tone="danger" render={<a href="/logs" />}>Read the log</Button>
          </>
        )}
      >
        The build stopped at step 4 of 6. The site still serves the previous version.
      </Alert>
      <Alert
        tone="info"
        title="Two people are editing this page"
        actions={<Button size="sm" variant="outline" tone="info">Show who</Button>}
      />
    </div>
  )
}
