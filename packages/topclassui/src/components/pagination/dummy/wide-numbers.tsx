import { Pagination } from '../index.js'

const orders = (page: number) => `?page=${String(page)}`

/** Page 12,345 of 123,456: a cell grows with its number, so no digit leaves the box. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination size="xs" value={12345} pageCount={123456} getHref={orders} aria-label="Extra small" />
      <Pagination size="sm" value={12345} pageCount={123456} getHref={orders} aria-label="Small" />
      <Pagination value={12345} pageCount={123456} getHref={orders} aria-label="Medium" />
    </div>
  )
}
