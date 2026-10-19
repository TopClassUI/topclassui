import { Breadcrumb } from '../index.js'

/** The states a server can render: a trail ending on the page being read, one of ancestors only,
 * a lone current page, a long trail folded by maxItems and one that opens on the house icon.
 * Five navs on one page need a name each, so every one passes its own. */
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
      <Breadcrumb
        aria-label="Folded to three crumbs"
        maxItems={3}
        items={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs/components', label: 'Components' },
          { href: '/docs/components/actions', label: 'Actions' },
          { href: '/docs/components/actions/button', label: 'Button' },
          { label: 'Props' },
        ]}
      />
      <Breadcrumb
        aria-label="Home as an icon"
        showHome
        items={[
          { href: '/', label: 'Home' },
          { href: '/docs', label: 'Docs' },
          { label: 'Button' },
        ]}
      />
    </div>
  )
}
