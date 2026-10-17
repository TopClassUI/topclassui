import { Breadcrumb } from '../index.js'

/** The states a server can render: a trail ending on the page being read, one of ancestors only,
 * and a lone current page. Three navs on one page need a name each, so every one passes its own. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <Breadcrumb
        aria-label="Ending on the current page"
        items={[
          { href: '/', label: 'Home' },
          { href: '/docs', label: 'Docs' },
          { label: 'Breadcrumb' },
        ]}
      />
      <Breadcrumb
        aria-label="Every crumb a link"
        items={[
          { href: '/', label: 'Home' },
          { href: '/shop', label: 'Shop' },
        ]}
      />
      <Breadcrumb aria-label="Only the current page" items={[{ label: 'Home' }]} />
    </div>
  )
}
