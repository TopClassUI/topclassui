import { Breadcrumb } from '../index.js'

/** Only the ancestors: every crumb is a link, so nothing is marked as the current page. */
export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { href: '/', label: 'Home' },
        { href: '#shop', label: 'Shop' },
        { href: '#shoes', label: 'Shoes' },
      ]}
    />
  )
}
