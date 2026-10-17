import { Breadcrumb } from '../index.js'

/** The last item has no href: it is the page being read, and it stays out of the JSON-LD. */
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
