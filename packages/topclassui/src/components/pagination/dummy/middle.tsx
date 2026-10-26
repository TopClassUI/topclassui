import { Pagination } from '../index.js'

const blog = (page: number) => `#page-${String(page)}`

/** Away from both ends: one sibling each side, one page at each end and a gap between. */
export default function Demo() {
  return <Pagination value={6} pageCount={12} getHref={blog} />
}
