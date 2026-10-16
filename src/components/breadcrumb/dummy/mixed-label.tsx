import { Breadcrumb } from '../index.js'

const NOTES = 'Release notes ملاحظات الإصدار لكل مكوّن في المكتبة'
const PAGE = 'Logical properties الخصائص المنطقية في كل مكوّن'

/** A label that starts in English and goes on in Arabic is cut at its own end, the right, on a page of either direction. */
export default function Demo() {
  return (
    <div className="w-60 rounded-box border border-line p-2">
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { href: '/release-notes', label: NOTES },
          { label: PAGE },
        ]}
      />
    </div>
  )
}
