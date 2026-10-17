import type { PaginationDesignProps } from '../types.js'
import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** The list the docs' Try it drives. value and pageCount have no default in the schema, so the
 * stage opens on page 6 of 12, where a gap shows at each side. */
export default function Demo({ value = 6, pageCount = 12, siblingCount, boundaryCount, size }: Partial<PaginationDesignProps> = {}) {
  return (
    <Pagination
      value={value}
      pageCount={pageCount}
      siblingCount={siblingCount}
      boundaryCount={boundaryCount}
      size={size}
      getHref={blog}
    />
  )
}
