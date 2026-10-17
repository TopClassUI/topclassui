'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '#components/button/index.js'
import { Tag } from '../index.js'

const TOPICS = ['Design systems', 'Accessibility', 'React', 'Tailwind', 'Right to left', 'Server Components']

/** onRemove needs a client file. The caller owns the list and takes the topic out; the x hands the focus to the
 * next x, or the one before, and when the list empties the caller moves it to the button that brings it back. */
export default function Demo() {
  const [topics, setTopics] = useState(TOPICS)
  const restore = useRef<HTMLButtonElement>(null)

  // Runs after the x's own move, so the button that brings the list back takes the focus.
  useEffect(() => {
    if (topics.length === 0) restore.current?.focus()
  }, [topics])

  return (
    <div className="flex flex-col items-start gap-3">
      <ul aria-label="Topics" className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={topic} className="flex max-w-full">
            <Tag onRemove={() => { setTopics(topics.filter((other) => other !== topic)) }}>
              {topic}
            </Tag>
          </li>
        ))}
      </ul>
      {topics.length === 0 ? (
        <Button ref={restore} variant="outline" size="sm" onClick={() => { setTopics(TOPICS) }}>Restore the topics</Button>
      ) : null}
    </div>
  )
}
