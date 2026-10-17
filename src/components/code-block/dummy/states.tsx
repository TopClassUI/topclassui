import { CodeBlock } from '../index.js'

const CODE = `export default async function Page() {
  const invoices = await getInvoices()
  return <InvoiceTable items={invoices} />
}`

const LONG = `export const columns = ['number', 'customer', 'issued', 'due', 'amount', 'status', 'actions'] as const`

/** The states a server can render, each with its name under it; the button's hover and "Copied" are live in the browser. */
export default function Demo() {
  return (
    <div className="grid gap-6 text-sm text-muted">
      <div className="grid gap-2">
        <CodeBlock lang="tsx" title="page.tsx">{CODE}</CodeBlock>
        <span>Idle</span>
      </div>
      <div className="grid gap-2">
        <CodeBlock lang="tsx" title="columns.ts" wrap>{LONG}</CodeBlock>
        <span>Wrapped</span>
      </div>
      <div className="grid gap-2">
        <CodeBlock lang="tsx" showCopy={false}>{CODE}</CodeBlock>
        <span>No header</span>
      </div>
    </div>
  )
}
