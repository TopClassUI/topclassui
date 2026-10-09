import { Button } from '#components/button/index.js'
import { Table, type TableColumn } from '../index.js'

interface Member { id: number; name: string; role: string }

const nobody: Member[] = []

const columns: TableColumn<Member>[] = [
  { key: 'name', header: 'Name', cell: (member) => member.name },
  { key: 'role', header: 'Role', cell: (member) => member.role },
  { key: 'id', header: 'Member number', align: 'end', cell: (member) => member.id },
]

/** No items: one row across every column, with the built-in words or the caller's own. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <Table caption="Pending invitations" items={nobody} getKey={(member) => member.id} columns={columns} />
      <Table
        caption="Team members"
        captionVisible
        items={nobody}
        getKey={(member) => member.id}
        columns={columns}
        emptyFallback={(
          <div className="grid justify-items-center gap-3 py-4">
            <p>Nobody has joined this team yet.</p>
            <Button size="sm" render={<a href="/team/invite" />}>Invite a member</Button>
          </div>
        )}
      />
    </div>
  )
}
