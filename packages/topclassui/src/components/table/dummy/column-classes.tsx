import { Table } from '../index.js'

interface Ticket { id: string; subject: string; note: string; opened: string; assignee: string; replies: number }

const tickets: Ticket[] = [
  {
    id: 'T-2041',
    subject: 'Invoice total is wrong',
    note: 'The customer was charged twice for the March renewal. Finance has refunded one payment and is waiting for the bank.',
    opened: '12 Mar 2026',
    assignee: 'Layla Haddad',
    replies: 14,
  },
  {
    id: 'T-2038',
    subject: 'Cannot invite a member',
    note: 'The invitation email never arrives at addresses on the company domain.',
    opened: '9 Mar 2026',
    assignee: 'Sara Nasser',
    replies: 3,
  },
  {
    id: 'T-2030',
    subject: 'Export is empty',
    note: 'Fixed in the last release. Waiting for the customer to confirm.',
    opened: '2 Mar 2026',
    assignee: 'Yousef Karim',
    replies: 120,
  },
]

/** Whoever is signed in: an agent sees no Assignee column. */
const viewer = { name: 'Omar Abed', canAssign: false }

/** A class per column: prose that wraps at a width of its own, a date hidden on a phone, and a column left out by a flag. */
export default function Demo() {
  return (
    <Table
      caption="Open tickets"
      items={tickets}
      getKey={(ticket) => ticket.id}
      columns={[
        { key: 'id', header: 'Ticket', rowHeader: true, cell: (ticket) => ticket.id },
        { key: 'subject', header: 'Subject', cell: (ticket) => ticket.subject },
        { key: 'note', header: 'Last note', className: 'min-w-64 whitespace-normal', cell: (ticket) => ticket.note },
        { key: 'opened', header: 'Opened', className: 'hidden sm:table-cell', cell: (ticket) => ticket.opened },
        viewer.canAssign && { key: 'assignee', header: 'Assignee', cell: (ticket) => ticket.assignee },
        { key: 'replies', header: 'Replies', align: 'end', cell: (ticket) => ticket.replies },
      ]}
    />
  )
}
