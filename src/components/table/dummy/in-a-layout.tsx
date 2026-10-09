import { Table, type TableColumn } from '../index.js'

interface Order { id: string; customer: string; placed: string; status: string; items: number; total: string }

const orders: Order[] = [
  { id: 'ORD-5521', customer: 'Northwind Traders', placed: '12 Mar 2026', status: 'Awaiting payment', items: 14, total: '$1,250.00' },
  { id: 'ORD-5520', customer: 'Contoso Ltd', placed: '11 Mar 2026', status: 'Shipped', items: 3, total: '$480.00' },
  { id: 'ORD-5519', customer: 'Fabrikam Inc', placed: '11 Mar 2026', status: 'Awaiting payment', items: 120, total: '$9,120.50' },
  { id: 'ORD-5518', customer: 'Adventure Works', placed: '9 Mar 2026', status: 'Delivered', items: 1, total: '$76.00' },
]

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Order', rowHeader: true, cell: (order) => order.id },
  { key: 'customer', header: 'Customer', cell: (order) => order.customer },
  { key: 'placed', header: 'Placed', cell: (order) => order.placed },
  { key: 'status', header: 'Status', cell: (order) => order.status },
  { key: 'items', header: 'Items', align: 'end', cell: (order) => order.items },
  { key: 'total', header: 'Total', align: 'end', cell: (order) => order.total },
]

/** The two layouts a dashboard is made of, a card in a grid and a column beside a sidebar: on a phone the table scrolls inside each, and the page does not. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-box bg-surface p-4 lg:col-span-2">
          <h2 className="pb-3 text-sm font-semibold">Recent orders</h2>
          <Table caption="Recent orders" items={orders} getKey={(order) => order.id} columns={columns} />
        </section>
        <section className="rounded-box bg-surface p-4">
          <h2 className="pb-3 text-sm font-semibold">This week</h2>
          <p className="text-sm text-muted">128 orders and 4 refunds.</p>
        </section>
      </div>
      <div className="flex gap-6">
        <p className="hidden w-40 shrink-0 text-sm text-muted sm:block">Orders that still wait for a payment.</p>
        <div className="flex-1">
          <Table
            striped
            caption="Orders awaiting payment"
            items={orders.filter((order) => order.status === 'Awaiting payment')}
            getKey={(order) => order.id}
            columns={columns}
          />
        </div>
      </div>
    </div>
  )
}
