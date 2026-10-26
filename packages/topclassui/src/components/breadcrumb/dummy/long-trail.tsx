import { Breadcrumb } from '../index.js'

/** Nine crumbs in a narrow column: the list wraps, and each caret stays with its crumb. */
export default function Demo() {
  return (
    <div className="max-w-85 rounded-box border border-line p-2">
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { href: '#docs', label: 'Documentation' },
          { href: '#components', label: 'Components' },
          { href: '#navigation', label: 'Navigation and disclosure' },
          { href: '#breadcrumb', label: 'Breadcrumb' },
          { href: '#examples', label: 'Examples' },
          { href: '#server', label: 'Server rendering' },
          { href: '#json-ld', label: 'Structured data' },
          { label: 'Escaping a label' },
        ]}
      />
    </div>
  )
}
