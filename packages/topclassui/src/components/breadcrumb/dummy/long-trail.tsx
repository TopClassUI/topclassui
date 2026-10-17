import { Breadcrumb } from '../index.js'

/** Nine crumbs in a narrow column: the list wraps, and each caret stays with its crumb. */
export default function Demo() {
  return (
    <div className="max-w-85 rounded-box border border-line p-2">
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { href: '/docs', label: 'Documentation' },
          { href: '/docs/components', label: 'Components' },
          { href: '/docs/components/navigation', label: 'Navigation and disclosure' },
          { href: '/docs/components/navigation/breadcrumb', label: 'Breadcrumb' },
          { href: '/docs/components/navigation/breadcrumb/examples', label: 'Examples' },
          { href: '/docs/components/navigation/breadcrumb/examples/server', label: 'Server rendering' },
          { href: '/docs/components/navigation/breadcrumb/examples/server/json-ld', label: 'Structured data' },
          { label: 'Escaping a label' },
        ]}
      />
    </div>
  )
}
