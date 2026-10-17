import { Tag } from '../index.js'

const TOPICS = ['Design systems', 'Accessibility', 'React', 'Tailwind', 'Right to left', 'Server Components']

/** The docs sample: a wrapping row of topics, each at the default tone. */
export default function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      {TOPICS.map((topic) => <Tag key={topic} tone="neutral">{topic}</Tag>)}
    </div>
  )
}
