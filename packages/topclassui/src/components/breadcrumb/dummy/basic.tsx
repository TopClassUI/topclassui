import { Breadcrumb } from '../index.js'

/** The stage the frame draws: the house icon for Home, then Docs and Components, and the page being read last, with no
 * href. No siteUrl, so no JSON-LD. */
export default function Demo() {
  return (
    <Breadcrumb
      showHome
      items={[
        { href: '/', label: 'Home' },
        { href: '/docs', label: 'Docs' },
        { href: '/docs/components', label: 'Components' },
        { label: 'Button' },
      ]}
    />
  )
}
