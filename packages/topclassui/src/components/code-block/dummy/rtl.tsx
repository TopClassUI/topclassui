import { getLabels } from '#shared/labels/get-labels.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { CodeBlock } from '../index.js'

/** Arabic: the header keeps the page's direction, so the button sits at the inline end, on the
 * left, and the button reads its Arabic name. The code still reads left to right. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <CodeBlock {...getLabels('ar')} lang="tsx" title="الفواتير.tsx">
          {`export default async function Page() {
  const invoices = await getInvoices()
  return <InvoiceTable items={invoices} />
}`}
        </CodeBlock>
      </div>
    </TopClassProvider>
  )
}
