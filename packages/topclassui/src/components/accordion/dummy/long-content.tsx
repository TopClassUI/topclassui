import { Badge } from '#components/badge/index.js'
import { Button } from '#components/button/index.js'
import { AccordionItem, AccordionRoot } from '../index.js'

const WORD = 'a'.repeat(300)
const COLUMNS = ['Order', 'Customer', 'Placed', 'Status', 'Items', 'Total', 'Warehouse', 'Carrier']
const ORDERS = [
  ['ORD-5521', 'Northwind Traders', '12 March 2026', 'Awaiting payment', '14', '$1,250.00', 'Amman, building 4', 'Aramex'],
  ['ORD-5519', 'Fabrikam Incorporated', '11 March 2026', 'Awaiting a refund', '120', '$9,120.50', 'Irbid, building 1', 'DHL Express'],
]

/** Hostile content. A title of one 300-letter word wraps beside the caret. A title that is an element
 * keeps its badge. A table wider than the box scrolls inside its panel, which is then a tab stop; it
 * starts closed, because that needs the browser. An accordion inside a panel takes the next level. */
export default function Demo() {
  return (
    <AccordionRoot multiple defaultValue={['word', 'element', 'nested']} className="max-w-105">
      <AccordionItem value="word" title={WORD} headingLevel={2}>
        <Button size="sm" variant="outline" render={<a href="#orders" />}>See every order</Button>
        <p className="pt-2">{WORD}</p>
      </AccordionItem>
      <AccordionItem
        value="element"
        headingLevel={2}
        title={<span className="flex flex-wrap items-center gap-2"><span>Invoices</span><Badge tone="info">3 new</Badge></span>}
      >
        <p>Three invoices arrived since your last visit.</p>
      </AccordionItem>
      <AccordionItem value="table" title="Orders that wait for a payment" headingLevel={2}>
        <table className="w-max whitespace-nowrap">
          <thead>
            <tr>
              {COLUMNS.map((column) => <th key={column} scope="col" className="pe-6 pb-2 text-start font-medium">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((order) => (
              <tr key={order[0]}>{order.map((cell) => <td key={cell} className="pe-6 pb-2">{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </AccordionItem>
      <AccordionItem value="nested" title="Shipping" headingLevel={2}>
        <AccordionRoot>
          <AccordionItem value="inside" title="Inside the country" headingLevel={3}>
            <p>Two working days.</p>
          </AccordionItem>
          <AccordionItem value="abroad" title="Abroad" headingLevel={3}>
            <p>Five to nine working days.</p>
          </AccordionItem>
        </AccordionRoot>
      </AccordionItem>
    </AccordionRoot>
  )
}
