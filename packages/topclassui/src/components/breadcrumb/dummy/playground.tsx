import { Breadcrumb } from '../index.js'
import type { BreadcrumbDesignProps } from '../types.js'

/** The site's Try it stage: the frame's trail, with the house for Home and maxItems at the 4 the frame draws. */
export default function Demo({ showHome = true, maxItems = 4, ...props }: BreadcrumbDesignProps = {}) {
  return (
    <Breadcrumb
      showHome={showHome}
      maxItems={maxItems}
      {...props}
      items={[
        { href: '/', label: 'Home' },
        { href: '#docs', label: 'Docs' },
        { href: '#components', label: 'Components' },
        { label: 'Button' },
      ]}
    />
  )
}
