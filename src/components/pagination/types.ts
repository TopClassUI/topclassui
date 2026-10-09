import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { PAGINATION_GAPS } from './constants.js'
import type { PaginationSchemaInput } from './schema.js'

export type PaginationGap = (typeof PAGINATION_GAPS)[number]

/** One cell of the list: a page number, or the gap standing for the pages left out. */
export type PaginationItem = number | PaginationGap

/** R-8.3-4: the schema as it is. value and pageCount have no default there, so the
 * type requires them; the three with a default stay optional. */
export type PaginationDesignProps = PaginationSchemaInput

/** The four numbers the page list is worked out from, before any clamp. Spelled per key:
 * Required<> keeps zod's written `| undefined` under exactOptionalPropertyTypes. */
export type PaginationRange = {
  [K in keyof Omit<PaginationSchemaInput, 'size'>]-?: NonNullable<PaginationSchemaInput[K]>
}

/** What Pagination writes on each link, whichever element renders it. */
export interface PaginationLinkParts {
  'aria-label': string
  'aria-current'?: 'page' | undefined
  rel?: 'prev' | 'next' | undefined
  className: string
  children: ReactNode
}

/** The nav writes its own list, so it takes no content. */
type Owned = 'children' | 'dangerouslySetInnerHTML'

export interface PaginationProps
  extends Omit<ComponentPropsWithRef<'nav'>, Owned>, PaginationDesignProps {
  /** The address of a page, so every cell is a real link a crawler can follow. */
  getHref: (page: number) => string
  /** The element every link is cloned from, such as `link={<Link href="" />}`; its href is replaced. */
  link?: ReactElement | undefined
  /** The built-in strings: the name of the nav, of each page and of the four icon links. Defaults to English. */
  labels?: Labels | undefined
  /** The locale the page numbers are formatted in. Defaults to `en`. */
  locale?: string | undefined
}
