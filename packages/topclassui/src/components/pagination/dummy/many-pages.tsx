import { Pagination } from '../index.js'

const orders = (page: number) => `#page-${String(page)}`

/** 500 pages are still eleven cells: two at each end, two each side of 250 and two gaps. */
export default function Demo() {
  return <Pagination value={250} pageCount={500} siblingCount={2} boundaryCount={2} getHref={orders} />
}
