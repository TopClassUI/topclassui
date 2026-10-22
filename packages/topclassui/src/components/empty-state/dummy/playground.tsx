import { plus } from '#icons/data/plus.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'
import type { EmptyStateDesignProps } from '../index.js'

/** The docs stage, with-action's drawing: the Try it controls set the schema's props, and the words stay put. */
export default function Demo(props: EmptyStateDesignProps = {}) {
  return (
    <div className="max-w-85">
      <EmptyState {...props} title="No projects yet" description="Create your first project and it will show up here.">
        <Button size="xs" className="gap-1.5" render={<a href="/projects/new" />}>
          <Svg icon={plus} />
          New project
        </Button>
      </EmptyState>
    </div>
  )
}
