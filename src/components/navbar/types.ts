import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { NavbarSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type NavbarDesignProps = {
  [K in keyof NavbarSchemaInput]?: NavbarSchemaInput[K] | undefined
}

/** How the top of the bar is padded: one that sticks clears the safe area, one in the flow does not. */
export type NavbarTop = 'sticky' | 'flow'

export interface NavbarRootProps
  extends Omit<ComponentPropsWithRef<'header'>, 'children'>, Pick<NavbarDesignProps, 'sticky'> {
  /** The parts, in order: NavbarBrand, NavbarLinks and NavbarActions. Each one is optional. */
  children?: ReactNode | undefined
}

// R-5.7-4: the element form only, so it resolves without a hook in a Server Component.
export interface NavbarBrandProps extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  /** The element the brand is drawn as, such as `render={<Link href="/" />}`. A plain anchor without it. */
  render?: ReactElement | undefined
  /** The name of the site, with a logo before it if there is one. */
  children?: ReactNode | undefined
}

export interface NavbarLinksProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /** The built-in strings; the nav is named by `labels.navbar.label`. Defaults to English. */
  labels?: Labels | undefined
  /** Accepted so `{...getLabels(locale)}` spreads cleanly. Nothing here formats a number, so it never reaches the element. */
  locale?: string | undefined
  /** The links: one NavbarLink each. */
  children?: ReactNode | undefined
}

export interface NavbarLinkProps
  extends Omit<ComponentPropsWithRef<'a'>, 'children'>, Pick<NavbarDesignProps, 'current'> {
  /** The element the link is drawn as, such as `render={<Link href="/docs" />}`. A plain anchor without it. */
  render?: ReactElement | undefined
  /** The text of the link. */
  children?: ReactNode | undefined
}

export interface NavbarActionsProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** What sits at the end of the bar: a Button, a search Input, an Avatar. */
  children?: ReactNode | undefined
}

/** No content and no way to un-hide it: the placeholder only holds the bar's shape. */
export type NavbarSkeletonProps =
  Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<NavbarDesignProps, 'sticky' | 'links'>
