import { Breadcrumb } from '../index.js'

const NOTES = 'Release notes ملاحظات الإصدار لكل مكوّن في المكتبة'
const PAGE = 'Logical properties الخصائص المنطقية في كل مكوّن'

/** A label that starts in English and goes on in Arabic runs in the page direction: English first, cut at the page's end. */
export default function Demo() {
  return (
    <div className="w-60 rounded-box border border-line p-2">
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { href: '#release-notes', label: NOTES },
          { label: PAGE },
        ]}
      />
    </div>
  )
}
