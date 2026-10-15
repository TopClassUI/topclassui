import { CodeBlock } from '../index.js'

/** The drawn block: a file name, the copy button, and the code passed as a template literal. */
export default function Demo() {
  return (
    <CodeBlock lang="tsx" title="page.tsx">
      {`export default async function Page() {
  const invoices = await getInvoices()
  return <InvoiceTable items={invoices} />
}`}
    </CodeBlock>
  )
}
