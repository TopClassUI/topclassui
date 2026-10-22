import { plus } from '#icons/data/plus.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

/** The drawing: a caller's title and description, and a link styled as an xs Button, 6 px between its icon and word. */
export default function Demo() {
  return (
    <div className="max-w-85">
      <EmptyState
        title="No projects yet"
        description="Create your first project and it will show up here."
      >
        <Button size="xs" className="gap-1.5" render={<a href="/projects/new" />}>
          <Svg icon={plus} />
          New project
        </Button>
      </EmptyState>
    </div>
  )
}
