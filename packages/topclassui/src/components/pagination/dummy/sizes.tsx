import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** Two navs on one page need a name each, so every one here passes its own aria-label. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination size="xs" value={3} pageCount={12} getHref={blog} aria-label="Extra small" />
      <Pagination size="sm" value={3} pageCount={12} getHref={blog} aria-label="Small" />
      <Pagination size="md" value={3} pageCount={12} getHref={blog} aria-label="Medium" />
      <Pagination size="lg" value={3} pageCount={12} getHref={blog} aria-label="Large" />
      <Pagination size="xl" value={3} pageCount={12} getHref={blog} aria-label="Extra large" />
    </div>
  )
}
