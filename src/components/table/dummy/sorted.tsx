import { Table } from '../index.js'

interface Customer { id: number; name: string; plan: string; seats: number }

const byName: Customer[] = [
  { id: 3, name: 'Adventure Works', plan: 'Team', seats: 12 },
  { id: 1, name: 'Contoso Ltd', plan: 'Enterprise', seats: 240 },
  { id: 4, name: 'Fabrikam Inc', plan: 'Free', seats: 1 },
  { id: 2, name: 'Northwind Traders', plan: 'Team', seats: 38 },
]

const bySeats = [...byName].sort((a, b) => b.seats - a.seats)

/** Each header is a link the server answers; the sorted one carries aria-sort and a caret. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <Table
        caption="Customers, by name"
        captionVisible
        items={byName}
        getKey={(customer) => customer.id}
        sort={{ key: 'name', direction: 'ascending' }}
        columns={[
          { key: 'name', header: 'Customer', sortHref: '?sort=name&dir=desc', cell: (customer) => customer.name },
          { key: 'plan', header: 'Plan', cell: (customer) => customer.plan },
          { key: 'seats', header: 'Seats', align: 'end', sortHref: '?sort=seats&dir=desc', cell: (customer) => customer.seats },
        ]}
      />
      <Table
        caption="Customers, by seats"
        captionVisible
        items={bySeats}
        getKey={(customer) => customer.id}
        sort={{ key: 'seats', direction: 'descending' }}
        columns={[
          { key: 'name', header: 'Customer', sortHref: '?sort=name&dir=asc', cell: (customer) => customer.name },
          { key: 'plan', header: 'Plan', cell: (customer) => customer.plan },
          { key: 'seats', header: 'Seats', align: 'end', sortHref: '?sort=seats&dir=asc', cell: (customer) => customer.seats },
        ]}
      />
    </div>
  )
}
