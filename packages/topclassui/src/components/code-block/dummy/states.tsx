import { en } from '#shared/labels/en.js'
import { CodeBlock } from '../index.js'

const CODE = `export default async function Page() {
  const invoices = await getInvoices()
  return <InvoiceTable items={invoices} />
}`

const LONG = `export const columns = ['number', 'customer', 'issued', 'due', 'amount', 'status', 'actions'] as const`

/** One cell per state the server renders, named by its aria-label; the button's hover and "Copied" are live in the browser. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="idle">
        <CodeBlock lang="tsx" title="app/page.tsx">{CODE}</CodeBlock>
      </div>
      <div role="group" aria-label="wrapped">
        <CodeBlock lang="tsx" title="columns.ts" wrap>{LONG}</CodeBlock>
      </div>
      <div role="group" aria-label="no header">
        <CodeBlock lang="sh" showCopy={false} labels={{ ...en, common: { ...en.common, code: 'Install command' } }}>{'pnpm add topclassui zod'}</CodeBlock>
      </div>
      <div role="group" aria-label="no copy button">
        <CodeBlock lang="tsx" title="app/reports/page.tsx" showCopy={false}>{CODE}</CodeBlock>
      </div>
    </div>
  )
}
