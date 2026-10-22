import type { ComponentPropsWithRef, ReactElement } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { BreadcrumbSchemaInput } from './schema.js'

/** One step of the trail. */
export interface BreadcrumbItem {
  /** Where the crumb goes. Leave it off the last item, which is the page being read. */
  href?: string | undefined
  /** The text of the crumb, and its `name` in the JSON-LD. */
  label: string
  /** This crumb's own link element, in place of the trail's `link`, for attributes one crumb alone carries. */
  link?: ReactElement | undefined
}

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type BreadcrumbDesignProps = {
  [K in keyof BreadcrumbSchemaInput]?: BreadcrumbSchemaInput[K] | undefined
}

/** The trail is `items`, so the nav takes no children of its own. */
export interface BreadcrumbProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children' | 'dangerouslySetInnerHTML'>, BreadcrumbDesignProps {
  /** The trail as `{ href?, label }`, root first. An item with an `href` is a link; the last one without is the current page. */
  items: readonly BreadcrumbItem[]
  /** The element every crumb link is cloned from, such as `link={<Link href="" />}`; its href is replaced with the item's. */
  link?: ReactElement | undefined
  /** The built-in strings; the nav is named by `labels.breadcrumb.label`. Defaults to English. */
  labels?: Labels | undefined
  /** Accepted so `{...getLabels(locale)}` spreads cleanly. Nothing here formats a number, so it is not used and never reaches the element. */
  locale?: string | undefined
}
