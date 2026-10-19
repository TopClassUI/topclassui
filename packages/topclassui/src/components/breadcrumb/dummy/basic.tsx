import { Breadcrumb } from '../index.js'

/** The last item has no href: it is the page being read. No siteUrl, so no JSON-LD. */
export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { href: '/', label: 'Home' },
        { href: '/docs', label: 'Docs' },
        { label: 'Breadcrumb' },
      ]}
    />
  )
}
