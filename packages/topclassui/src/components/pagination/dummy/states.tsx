import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** The states a server can render: on the first page and the last, first and previous or next
 * and last are spans, not links; a single page leaves all four as spans, and disabled every cell. Each nav has its own name. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination value={1} pageCount={12} getHref={blog} aria-label="On the first page" />
      <Pagination value={6} pageCount={12} getHref={blog} aria-label="In the middle" />
      <Pagination value={12} pageCount={12} getHref={blog} aria-label="On the last page" />
      <Pagination value={1} pageCount={1} getHref={blog} aria-label="A single page" />
      <Pagination value={1} pageCount={12} getHref={blog} disabled aria-label="Switched off" />
    </div>
  )
}
