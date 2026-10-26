import { Pagination } from '../index.js'

const blog = (page: number) => `#page-${String(page)}`

/** custom emits no size: a cell falls to the 24 px floor and takes the type size of the nav. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination value={3} pageCount={12} getHref={blog} aria-label="The scale" />
      <Pagination size="custom" className="text-xs" value={3} pageCount={12} getHref={blog} aria-label="Your own cells" />
    </div>
  )
}
