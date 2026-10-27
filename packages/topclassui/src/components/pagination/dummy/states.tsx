import { Pagination } from '../index.js'

const blog = (page: number) => `?page=${String(page)}`

/** The four states the frame draws, at xs over three pages so each full row fits its cell: on the first page and the
 * last, first and previous or next and last are spans, not links; disabled, every cell is. Each nav has its own name. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination size="xs" value={1} pageCount={3} getHref={blog} aria-label="first page" />
      <Pagination size="xs" value={2} pageCount={3} getHref={blog} aria-label="middle" />
      <Pagination size="xs" value={3} pageCount={3} getHref={blog} aria-label="last page" />
      <Pagination size="xs" value={1} pageCount={3} getHref={blog} disabled aria-label="disabled" />
    </div>
  )
}
