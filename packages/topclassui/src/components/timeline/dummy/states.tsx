import { Timeline, TimelineSkeleton } from '../index.js'

const key = (event: { id: string }) => event.id

/** The strip's word beside each marker: small, regular and muted, as drawn. */
const WORD = 'font-mono text-xs font-normal text-muted'

/** Every state the strip draws, one cell each, captioned by its name: a marker and its word for done, current, todo and
 * error, then loading and empty. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      <Timeline aria-label="done" items={[{ id: 'done', title: <span className={WORD}>done</span>, status: 'done' }]} getKey={key} />
      <Timeline aria-label="current" items={[{ id: 'current', title: <span className={WORD}>current</span>, status: 'current' }]} getKey={key} />
      <Timeline aria-label="todo" items={[{ id: 'todo', title: <span className={WORD}>todo</span>, status: 'todo' }]} getKey={key} />
      <Timeline aria-label="error" items={[{ id: 'error', title: <span className={WORD}>error</span>, tone: 'danger' }]} getKey={key} />
      <div role="group" aria-label="loading" aria-busy="true">
        <TimelineSkeleton className="w-36" />
      </div>
      <div role="group" aria-label="empty">
        <Timeline items={[]} getKey={key} />
      </div>
    </div>
  )
}
