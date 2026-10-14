import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

import type { SidebarSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SidebarDesignProps = {
  [K in keyof SidebarSchemaInput]?: SidebarSchemaInput[K] | undefined
}

/** What the root shares with its trigger through context: the state, and the way to ask for another. */
export interface SidebarState {
  open: boolean
  setOpen: (open: boolean) => void
}

export interface SidebarRootProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children'>, Pick<SidebarDesignProps, 'open' | 'defaultOpen'> {
  /** Called with the state the trigger asks for, once a press. A function: pass it from a client file. */
  onOpenChange?: ((open: boolean) => void) | undefined
  /** A SidebarHeader, then a SidebarBody holding the groups and their links. */
  children?: ReactNode | undefined
}

/** A real button. Its type, its icon and aria-expanded are its own; its name comes from the labels. */
export type SidebarTriggerProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'type' | 'aria-expanded'>

/** The press a trigger takes, named here because hook.ts writes no type argument. */
export type SidebarTriggerEvent = Parameters<NonNullable<SidebarTriggerProps['onClick']>>[0]

export interface SidebarHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The title beside the trigger. It is hidden, and still read out, while the rail is collapsed. */
  children?: ReactNode | undefined
}

export interface SidebarBodyProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The groups. A list longer than the rail scrolls here, under the header. */
  children?: ReactNode | undefined
}

export interface SidebarGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The heading of the group, which names its list. Hidden, and still read out, while the rail is collapsed. */
  label?: ReactNode | undefined
  /** The SidebarLink rows of the group. */
  children?: ReactNode | undefined
}

/** A plain anchor, which the type will not let through without somewhere to go. */
interface SidebarLinkAsAnchor {
  render?: undefined
  /** Where the row goes. */
  href: string
}

// R-5.7-4: the element form only, so it resolves without a hook in a Server Component.
interface SidebarLinkAsElement {
  /** The link as another element, such as `render={<Link href="/docs" />}`, which carries its own href. */
  render: ReactElement
  href?: string | undefined
}

/** Everything but the parts below reaches the link itself, not the list item around it. */
export type SidebarLinkProps =
  Omit<ComponentPropsWithRef<'a'>, 'children' | 'href' | 'aria-current'>
  & (SidebarLinkAsAnchor | SidebarLinkAsElement)
  & Pick<SidebarDesignProps, 'current'>
  & {
    /** Drawn before the label, and all that is drawn while the rail is collapsed. Decorative: the label names the row. */
    icon?: ReactNode | undefined
    /** The label. It ends in an ellipsis when the rail is too narrow, and is cut at 100 characters. */
    children?: ReactNode | undefined
  }
