import { ar } from '#shared/labels/ar.js'
import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** The row runs from the right and the four carets flip, with no class of its own for it. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar">
      <Pagination value={3} pageCount={12} getHref={blog} labels={ar} locale="ar" />
    </div>
  )
}
