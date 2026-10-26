import { Pagination } from '../index.js'

const orders = (page: number) => `#page-${String(page)}`

/** Above and below one list: two navs on a page need a name each, so each passes aria-label. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination value={2} pageCount={8} getHref={orders} aria-label="Orders pages, top" />
      <p className="text-sm text-muted">Orders 26 to 50 of 200</p>
      <Pagination value={2} pageCount={8} getHref={orders} aria-label="Orders pages, bottom" />
    </div>
  )
}
