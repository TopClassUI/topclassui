import type { CodeBlockDesignProps } from '../index.js'
import { CodeBlock } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. One line is long, so wrap shows. */
export default function Demo({ showCopy, wrap }: CodeBlockDesignProps = {}) {
  return (
    <CodeBlock lang="tsx" title="page.tsx" showCopy={showCopy} wrap={wrap}>
      {`export default async function Page() {
  const invoices = await getInvoices({ status: 'overdue', sortBy: 'dueDate', order: 'descending' })
  return <InvoiceTable items={invoices} />
}`}
    </CodeBlock>
  )
}
