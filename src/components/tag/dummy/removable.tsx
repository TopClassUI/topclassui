'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '#components/button/index.js'
import { Tag } from '../index.js'

const TOPICS = ['Design systems', 'Accessibility', 'React', 'Tailwind', 'Right to left', 'Server Components']

/** onRemove needs a client file. The caller owns the list: it takes the topic out, then moves the
 * focus to the x that took its place, the one before it, or the button that brings the list back. */
export default function Demo() {
  const [topics, setTopics] = useState(TOPICS)
  const list = useRef<HTMLUListElement>(null)
  const restore = useRef<HTMLButtonElement>(null)
  const removed = useRef<number | null>(null)

  // The removed button left the document and took the focus with it: put the focus back.
  useEffect(() => {
    const index = removed.current
    if (index === null) return
    removed.current = null
    const buttons = [...(list.current?.querySelectorAll('button') ?? [])]
    ;(buttons[Math.min(index, buttons.length - 1)] ?? restore.current)?.focus()
  }, [topics])

  return (
    <div className="flex flex-col items-start gap-3">
      <ul ref={list} aria-label="Topics" className="flex flex-wrap gap-2">
        {topics.map((topic, index) => (
          <li key={topic} className="flex max-w-full">
            <Tag onRemove={() => { removed.current = index; setTopics(topics.filter((other) => other !== topic)) }}>
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
