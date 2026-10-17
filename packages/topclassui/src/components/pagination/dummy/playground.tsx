import type { PaginationDesignProps } from '../types.js'
import { Pagination } from '../index.js'

/** The list the docs' Try it drives. value and pageCount have no default in the schema, so the
 * stage opens on page 6 of 12, where a gap shows at each side. */
export default function Demo(props: Partial<PaginationDesignProps> = {}) {
  return <Pagination value={6} pageCount={12} getHref={(page) => `/blog?page=${String(page)}`} {...props} />
}
