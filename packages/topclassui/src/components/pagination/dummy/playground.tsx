import type { PaginationDesignProps } from '../types.js'
import { Pagination } from '../index.js'

/** The list the docs' Try it drives. value and pageCount have no default in the schema, so the
 * stage opens as the frame draws it: page 1 of 24 at sm, one gap before the last page. */
export default function Demo(props: Partial<PaginationDesignProps> = {}) {
  return <Pagination size="sm" value={1} pageCount={24} getHref={(page) => `/blog?page=${String(page)}`} {...props} />
}
