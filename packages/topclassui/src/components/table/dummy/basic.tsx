import { Button } from '#components/button/index.js'
import { Table } from '../index.js'

interface Invoice { id: string; number: string; customer: string; status: string; amount: string }

const invoices: Invoice[] = [
  { id: 'inv_1042', number: 'INV-1042', customer: 'Northwind Traders', status: 'Paid', amount: '$1,250.00' },
  { id: 'inv_1043', number: 'INV-1043', customer: 'Contoso Ltd', status: 'Due in 3 days', amount: '$480.00' },
  { id: 'inv_1044', number: 'INV-1044', customer: 'Fabrikam Inc', status: 'Overdue', amount: '$9,120.50' },
  { id: 'inv_1045', number: 'INV-1045', customer: 'Adventure Works', status: 'Paid', amount: '$76.00' },
]

/** The drawn table: a caption read out but not drawn, the invoice as the header of its row, and a link per row named by its invoice. */
export default function Demo() {
  return (
    <Table
      caption="Invoices"
      items={invoices}
      getKey={(invoice) => invoice.id}
      columns={[
        { key: 'number', header: 'Invoice', rowHeader: true, cell: (invoice) => invoice.number },
        { key: 'customer', header: 'Customer', cell: (invoice) => invoice.customer },
        { key: 'status', header: 'Status', cell: (invoice) => invoice.status },
        { key: 'amount', header: 'Amount', align: 'end', cell: (invoice) => invoice.amount },
        {
          key: 'open',
          header: <span className="sr-only">Open</span>,
          align: 'end',
          cell: (invoice) => (
            <Button
              size="sm"
              variant="outline"
              aria-label={`View invoice ${invoice.number}`}
              render={<a href={`#${invoice.id}`} />}
            >
              View
            </Button>
          ),
        },
      ]}
    />
  )
}
