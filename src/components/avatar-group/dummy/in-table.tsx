import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { Table } from '#components/table/index.js'
import { AvatarGroup } from '../index.js'

const INITIALS = ['OA', 'LH', 'SK', 'MN', 'RT'] as const

interface Project { id: string; name: string; members: number; due: string }

const PROJECTS: Project[] = [
  { id: 'billing', name: 'Billing redesign', members: 3, due: '12 Mar 2026' },
  { id: 'onboarding', name: 'Mobile onboarding', members: 5, due: '4 Apr 2026' },
  { id: 'search', name: 'Search migration', members: 20, due: '30 Jun 2026' },
]

/** Every member is rendered, and the group shows four and counts the rest. The ring takes
 * the colour of the table, which is a raised surface as a Card is. */
const team = (project: Project, placed: string) => (
  <AvatarGroup className="*:ring-surface-raised" aria-label={`${project.name}: ${placed}`}>
    {Array.from({ length: project.members }, (_, index) => (
      <AvatarRoot key={index} aria-label={`Member ${String(index + 1)}`}>
        <AvatarFallback>{INITIALS[index % INITIALS.length] ?? 'OA'}</AvatarFallback>
      </AvatarRoot>
    ))}
  </AvatarGroup>
)

/** A team column, three ways: alone in its cell, beside a count and in a box of its own.
 * Each keeps one row at its full width, and on a phone the table scrolls instead. */
export default function Demo() {
  return (
    <Table
      caption="Projects"
      items={PROJECTS}
      getKey={(project) => project.id}
      columns={[
        { key: 'name', header: 'Project', rowHeader: true, cell: (project) => project.name },
        { key: 'team', header: 'Team', cell: (project) => team(project, 'team') },
        {
          key: 'counted',
          header: 'With a count',
          cell: (project) => (
            <span className="inline-flex items-center gap-2">
              {team(project, 'team with a count')}
              <span>{project.members} people</span>
            </span>
          ),
        },
        {
          key: 'boxed',
          header: 'In a box',
          cell: (project) => (
            <div className="w-fit rounded-box border border-line p-1">{team(project, 'team in a box')}</div>
          ),
        },
        { key: 'due', header: 'Due', cell: (project) => project.due },
      ]}
    />
  )
}
