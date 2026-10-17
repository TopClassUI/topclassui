import type { CodeBlockDesignProps } from '../index.js'
import { CodeBlock } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. One line is long, so wrap shows. */
export default function Demo(props: CodeBlockDesignProps) {
  return (
    <CodeBlock lang="tsx" title="app/invoices/page.tsx" {...props}>
      {`export default async function Page() {
  const invoices = await getInvoices({ status: 'overdue', sortBy: 'dueDate', order: 'descending' })
  return <InvoiceTable items={invoices} />
}`}
    </CodeBlock>
  )
}
