import type { CodeBlockDesignProps } from '../index.js'
import { CodeBlock } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. One line is long, so wrap shows; 420 px
 * wide, as the frame draws it. */
export default function Demo(props: CodeBlockDesignProps) {
  return (
    <CodeBlock lang="tsx" title="app/invoices/page.tsx" className="w-full max-w-105" {...props}>
      {`export default async function Page() {
  const invoices = await getInvoices({ status: 'overdue', sortBy: 'dueDate', order: 'descending' })
  return <InvoiceTable items={invoices} />
}`}
    </CodeBlock>
  )
}
