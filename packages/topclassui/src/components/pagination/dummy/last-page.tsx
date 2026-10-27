import { Pagination } from '../index.js'

const blog = (page: number) => `?page=${String(page)}`

/** On the last page next and last are the spans; the row is still seven pages long. */
export default function Demo() {
  return <Pagination value={12} pageCount={12} getHref={blog} />
}
