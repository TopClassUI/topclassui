import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import { Table, type TableColumn } from '#components/table/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

interface Order { id: string; customer: string; placed: string; status: string; total: string }

const orders: Order[] = [
  { id: 'ORD-5521', customer: 'Northwind Traders', placed: '12 Mar 2026', status: 'Awaiting payment', total: '$1,250.00' },
  { id: 'ORD-5520', customer: 'Contoso Ltd', placed: '11 Mar 2026', status: 'Shipped', total: '$480.00' },
  { id: 'ORD-5519', customer: 'Fabrikam Inc', placed: '11 Mar 2026', status: 'Awaiting payment', total: '$9,120.50' },
]

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Order', rowHeader: true, cell: (order) => order.id },
  { key: 'customer', header: 'Customer', cell: (order) => order.customer },
  { key: 'placed', header: 'Placed', cell: (order) => order.placed },
  { key: 'status', header: 'Status', cell: (order) => order.status },
  { key: 'total', header: 'Total', align: 'end', cell: (order) => order.total },
]

/** The app shell: a flex row as tall as the screen, the rail, then a column that takes the
 * rest. The rail keeps its width; the column gives way, and its table scrolls inside it. */
export default function Demo() {
  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      <SidebarRoot>
        <SidebarHeader>Workspace</SidebarHeader>
        <SidebarBody>
          <SidebarGroup>
            <SidebarLink href="#home" icon={<Svg icon={house} />}>Home</SidebarLink>
            <SidebarLink href="#orders" icon={<Svg icon={folder} />} current>Orders</SidebarLink>
            <SidebarLink href="#team" icon={<Svg icon={users} />}>Team</SidebarLink>
            <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
      <div className="min-w-0 flex-1 overflow-y-auto p-4">
        <h2 className="pb-3 text-base font-semibold">Orders</h2>
        <Table caption="Orders" items={orders} getKey={(order) => order.id} columns={columns} />
      </div>
    </div>
  )
}
