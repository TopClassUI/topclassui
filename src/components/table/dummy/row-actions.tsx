import { Button } from '#components/button/index.js'
import { Table, type TableColumn } from '../index.js'

interface Order { number: number; customer: string; status: string; placed: string; total: string }

const customers = ['Northwind Traders', 'Contoso Ltd', 'Fabrikam Inc', 'Adventure Works', 'Tailspin Toys']
const statuses = ['Shipped', 'Awaiting payment', 'Delivered']

/** One page of 25, as a server would send it: the newest order first. */
const orders: Order[] = Array.from({ length: 25 }, (_, index) => ({
  number: 1042 - index,
  customer: customers[index % customers.length] ?? '',
  status: statuses[index % statuses.length] ?? '',
  placed: `${String(28 - index)} Mar 2026`,
  total: `$${String((index + 1) * 120)}.00`,
}))

const columns: TableColumn<Order>[] = [
  {
    key: 'number',
    header: 'Order',
    rowHeader: true,
    sortHref: '?sort=number&dir=asc',
    cell: (order) => (
      <Button size="sm" variant="link" render={<a href={`/orders/${String(order.number)}`} />}>
        {`#${String(order.number)}`}
      </Button>
    ),
  },
  { key: 'customer', header: 'Customer', sortHref: '?sort=customer&dir=asc', cell: (order) => order.customer },
  { key: 'status', header: 'Status', cell: (order) => order.status },
  { key: 'placed', header: 'Placed', sortHref: '?sort=placed&dir=asc', cell: (order) => order.placed },
  { key: 'total', header: 'Total', align: 'end', sortHref: '?sort=total&dir=asc', cell: (order) => order.total },
  {
    key: 'refund',
    header: <span className="sr-only">Actions</span>,
    align: 'end',
    // The name says which row: a list of buttons would otherwise read "Refund" 25 times.
    cell: (order) => (
      <Button size="sm" variant="outline" aria-label={`Refund order ${String(order.number)}`}>Refund</Button>
    ),
  },
]

/** A page of orders in a narrow box: a link in the stuck column, and an action per row named by its row. */
export default function Demo() {
  return (
    <div className="max-w-sm">
      <Table
        stickyFirstColumn
        caption="Orders"
        items={orders}
        getKey={(order) => String(order.number)}
        sort={{ key: 'number', direction: 'descending' }}
        columns={columns}
      />
    </div>
  )
}
