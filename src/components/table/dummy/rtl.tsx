import { ar } from '#shared/labels/ar.js'
import { Table, type TableColumn } from '../index.js'

interface Invoice { id: string; customer: string; status: string; due: string; amount: string }

const invoices: Invoice[] = [
  { id: 'فاتورة-١٠٤٢', customer: 'شركة الشمال للتجارة', status: 'مدفوعة', due: '١٢ مارس ٢٠٢٦', amount: '١٬٢٥٠٫٠٠ د.أ' },
  { id: 'فاتورة-١٠٤٣', customer: 'مؤسسة النخيل', status: 'تستحق بعد ٣ أيام', due: '١٨ مارس ٢٠٢٦', amount: '٤٨٠٫٠٠ د.أ' },
  { id: 'فاتورة-١٠٤٤', customer: 'دار الياسمين للنشر', status: 'متأخرة', due: '١ مارس ٢٠٢٦', amount: '٩٬١٢٠٫٥٠ د.أ' },
  { id: 'فاتورة-١٠٤٥', customer: 'مخبز الأمل', status: 'مدفوعة', due: '٢٥ فبراير ٢٠٢٦', amount: '٧٦٫٠٠ د.أ' },
]

const nobody: Invoice[] = []

const columns: TableColumn<Invoice>[] = [
  { key: 'id', header: 'الفاتورة', sortHref: '?sort=id&dir=asc', rowHeader: true, cell: (invoice) => invoice.id },
  { key: 'customer', header: 'العميل', sortHref: '?sort=customer&dir=asc', cell: (invoice) => invoice.customer },
  { key: 'status', header: 'الحالة', cell: (invoice) => invoice.status },
  { key: 'due', header: 'تاريخ الاستحقاق', cell: (invoice) => invoice.due },
  { key: 'amount', header: 'المبلغ', align: 'end', sortHref: '?sort=amount&dir=asc', cell: (invoice) => invoice.amount },
]

/** Arabic: the first column sticks to the right edge, the amounts end on the left, and the built-in words are Arabic. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="grid gap-6">
      <Table
        labels={ar}
        captionVisible
        caption="الفواتير"
        items={invoices}
        getKey={(invoice) => invoice.id}
        sort={{ key: 'amount', direction: 'descending' }}
        columns={columns}
      />
      <div className="max-w-sm">
        <Table
          labels={ar}
          stickyFirstColumn
          striped
          caption="الفواتير في مساحة ضيقة"
          items={invoices}
          getKey={(invoice) => invoice.id}
          sort={{ key: 'id', direction: 'ascending' }}
          columns={columns}
        />
      </div>
      <Table labels={ar} caption="فواتير الشهر القادم" items={nobody} getKey={(invoice) => invoice.id} columns={columns} />
    </div>
  )
}
