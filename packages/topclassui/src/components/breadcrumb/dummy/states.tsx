import { Breadcrumb } from '../index.js'

/** The states a server can render: a trail ending on the page being read, one of ancestors only,
 * a lone current page, a long trail folded by maxItems and one that opens on the house icon.
 * Five navs on one page need a name each, so every one passes its own. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <Breadcrumb
        aria-label="current"
        items={[
          { href: '/', label: 'Home' },
          { href: '/docs', label: 'Docs' },
          { label: 'Breadcrumb' },
        ]}
      />
      <Breadcrumb
        aria-label="idle"
        items={[
          { href: '/', label: 'Home' },
          { href: '/shop', label: 'Shop' },
        ]}
      />
      <Breadcrumb aria-label="current page only" items={[{ label: 'Home' }]} />
      <Breadcrumb
        aria-label="collapsed"
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
        aria-label="home icon"
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
