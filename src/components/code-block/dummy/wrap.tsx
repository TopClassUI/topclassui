import { CodeBlock } from '../index.js'

/** wrap: a long line breaks inside the block instead of scrolling it, and the code is no tab stop. */
export default function Demo() {
  return (
    <CodeBlock lang="tsx" title="invoice-row.tsx" wrap>
      {`export const columns = ['number', 'customer', 'issued', 'due', 'amount', 'status', 'actions'] as const satisfies readonly InvoiceColumn[]`}
    </CodeBlock>
  )
}
