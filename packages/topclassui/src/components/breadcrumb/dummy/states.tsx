import { Breadcrumb } from '../index.js'

/** One trail per state the Previewer frame draws that a server trail can show, in its order: ancestors only, a long trail folded
 * by maxItems, and one ending on the page being read. The frame's hover underlines one crumb, which no prop of the data reaches.
 * Three navs on one page need a name each, so every one passes its own. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Breadcrumb
        aria-label="idle"
        items={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs/button', label: 'Button' },
        ]}
      />
      <Breadcrumb
        aria-label="collapsed"
        maxItems={3}
        items={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs/components', label: 'Components' },
          { href: '/docs/components/actions', label: 'Actions' },
          { label: 'Button' },
        ]}
      />
      <Breadcrumb
        aria-label="current"
        items={[
          { href: '/docs', label: 'Docs' },
          { label: 'Button' },
        ]}
      />
    </div>
  )
}
