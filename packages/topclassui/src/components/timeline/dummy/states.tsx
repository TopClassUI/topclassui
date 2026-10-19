import { Timeline, TimelineSkeleton } from '../index.js'

const key = (event: { id: string }) => event.id

/** Every state the strip draws, one cell each, captioned by its name: done, current, todo, error, loading and empty. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      <Timeline aria-label="done" items={[{ id: 'done', title: 'Project created', time: '22 Sep, 00:14', status: 'done' }]} getKey={key} />
      <Timeline aria-label="current" items={[{ id: 'current', title: 'Invited three teammates', time: '22 Sep, 00:31', status: 'current' }]} getKey={key} />
      <Timeline aria-label="todo" items={[{ id: 'todo', title: 'First deploy', time: 'pending', status: 'todo' }]} getKey={key} />
      <Timeline aria-label="error" items={[{ id: 'error', title: 'Deploy failed', time: '22 Sep, 00:40', tone: 'danger' }]} getKey={key} />
      <div role="group" aria-label="loading" aria-busy="true">
        <TimelineSkeleton />
      </div>
      <div role="group" aria-label="empty">
        <Timeline items={[]} getKey={key} />
      </div>
    </div>
  )
}
