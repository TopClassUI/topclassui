import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** One cell per state the Previewer frame draws, each nav named by its aria-label: on the first page and the last, first and previous
 * or next and last are spans, not links, and disabled leaves every cell a span. A list narrower than 36rem turns compact (2026-10-19),
 * so each cell is given the width of the full row the frame draws. */
export default function Demo() {
  return (
    <div className="flex flex-wrap gap-4">
      <Pagination value={1} pageCount={12} getHref={blog} aria-label="first page" className="w-xl max-w-full" />
      <Pagination value={6} pageCount={12} getHref={blog} aria-label="middle" className="w-xl max-w-full" />
      <Pagination value={12} pageCount={12} getHref={blog} aria-label="last page" className="w-xl max-w-full" />
      <Pagination value={1} pageCount={12} getHref={blog} disabled aria-label="disabled" className="w-xl max-w-full" />
    </div>
  )
}
