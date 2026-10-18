import { Table } from '../index.js'

interface Entry { id: string; n: number; account: string; amount: string }

const ACCOUNTS = ['Cash', 'Receivables', 'Payables', 'Revenue', 'Expenses']

/** Ten thousand ledger entries in one table: the body mounts only the rows in view, under a sticky header, and
 * the box scrolls inside itself; the last row is entry 10000. */
const entries: Entry[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: `e${String(index + 1)}`,
  n: index + 1,
  account: ACCOUNTS[index % ACCOUNTS.length] ?? '',
  amount: `$${String((index * 37) % 1000)}.00`,
}))

export default function Demo() {
  return (
    <Table
      caption="Ten thousand entries"
      items={entries}
      getKey={(entry) => entry.id}
      striped
      columns={[
        { key: 'n', header: 'Entry', rowHeader: true, cell: (entry) => `Entry ${String(entry.n)}` },
        { key: 'account', header: 'Account', cell: (entry) => entry.account },
        { key: 'amount', header: 'Amount', align: 'end', cell: (entry) => entry.amount },
      ]}
    />
  )
}
