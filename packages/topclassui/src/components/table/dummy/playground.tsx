import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { Badge } from '#components/badge/index.js'
import { Table, type TableDesignProps } from '../index.js'

interface Member { id: string; name: string; initials: string; role: string; status: 'Active' | 'Invited' }

const members: Member[] = [
  { id: 'm_1', name: 'Omar Abed', initials: 'OA', role: 'Owner', status: 'Active' },
  { id: 'm_2', name: 'Layla Haddad', initials: 'LH', role: 'Editor', status: 'Active' },
  { id: 'm_3', name: 'Sami Nasser', initials: 'SN', role: 'Viewer', status: 'Invited' },
]

/** The docs card's stage, as the frame draws it: sorted by name, every column sortable, the Try it controls pass the schema's props. */
export default function Demo(props: TableDesignProps) {
  return (
    <Table
      {...props}
      caption="Team members, by name"
      items={members}
      getKey={(member) => member.id}
      sort={{ key: 'name', direction: 'ascending' }}
      columns={[
        {
          key: 'name',
          header: 'Name',
          rowHeader: true,
          sortHref: '?sort=name&dir=desc',
          cell: (member) => (
            <span className="-my-1 inline-flex items-center gap-2 align-middle">
              <AvatarRoot size="xs" aria-hidden>
                <AvatarFallback>{member.initials}</AvatarFallback>
              </AvatarRoot>
              {member.name}
            </span>
          ),
        },
        { key: 'role', header: 'Role', sortHref: '?sort=role', cell: (member) => member.role },
        {
          key: 'status',
          header: 'Status',
          sortHref: '?sort=status',
          cell: (member) => <Badge size="xs" tone={member.status === 'Active' ? 'success' : 'warning'}>{member.status}</Badge>,
        },
      ]}
    />
  )
}
