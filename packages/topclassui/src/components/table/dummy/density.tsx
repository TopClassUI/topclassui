import { Table, type TableColumn } from '../index.js'

interface Member { id: string; name: string; role: string }

const members: Member[] = [
  { id: 'm_1', name: 'Omar Abed', role: 'Owner' },
  { id: 'm_2', name: 'Layla Haddad', role: 'Editor' },
  { id: 'm_3', name: 'Sami Nasser', role: 'Viewer' },
]

const columns: TableColumn<Member>[] = [
  { key: 'name', header: 'Name', rowHeader: true, cell: (member) => member.name },
  { key: 'role', header: 'Role', cell: (member) => member.role },
]

/** The frame's two densities and two variants: comfortable and outlined, compact, and plain inside a box of its own. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <Table caption="Members, comfortable" items={members} getKey={(member) => member.id} columns={columns} />
      <Table density="compact" caption="Members, compact" items={members} getKey={(member) => member.id} columns={columns} />
      <Table variant="plain" caption="Members, plain" items={members} getKey={(member) => member.id} columns={columns} />
    </div>
  )
}
