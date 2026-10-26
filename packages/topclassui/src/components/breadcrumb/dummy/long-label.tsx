import { Breadcrumb } from '../index.js'

const LONG_LINK = 'Everything you need to know before migrating a design system'
const LONG_PAGE = 'A step-by-step guide to moving every component to logical properties'

/** A crumb wider than its box ends in an ellipsis instead of pushing the page apart. */
export default function Demo() {
  return (
    <div className="w-60 rounded-box border border-line p-2">
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { href: '#migrating', label: LONG_LINK },
          { label: LONG_PAGE },
        ]}
      />
    </div>
  )
}
