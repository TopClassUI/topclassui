import { Breadcrumb } from '../index.js'

/** The four states the frame draws, one nav each, named by its aria-label: a trail of ancestors only, a crumb under
 * the pointer (drawn with the data-hover a pointer would set), a long trail folded by maxItems, and the page being read. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <Breadcrumb
        className="text-xs *:gap-1.25 *:*:gap-1.25"
        aria-label="idle"
        items={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs/button', label: 'Button' },
        ]}
      />
      <Breadcrumb
        className="text-xs *:gap-1.25 *:*:gap-1.25"
        aria-label="hover"
        link={<a href="/" data-hover="" />}
        items={[
          { href: '/docs', label: 'Docs' },
          { label: 'Button' },
        ]}
      />
      <Breadcrumb
        className="text-xs *:gap-1.25 *:*:gap-1.25"
        aria-label="collapsed"
        maxItems={2}
        items={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs/components', label: 'Components' },
          { href: '/docs/components/actions', label: 'Actions' },
          { label: 'Button' },
        ]}
      />
      <Breadcrumb
        className="text-xs *:gap-1.25 *:*:gap-1.25"
        aria-label="current"
        items={[
          { href: '/docs', label: 'Docs' },
          { label: 'Button' },
        ]}
      />
    </div>
  )
}
