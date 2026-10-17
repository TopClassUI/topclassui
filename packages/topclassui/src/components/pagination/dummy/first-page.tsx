import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** On page 1 there is nowhere to go back to, so first and previous are spans, not links. */
export default function Demo() {
  return <Pagination value={1} pageCount={12} getHref={blog} />
}
