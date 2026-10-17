import type { ComponentPropsWithRef, ReactNode } from 'react'

/** Every part is a plain div, so each takes what a div takes, ref included. */
type DivProps = Omit<ComponentPropsWithRef<'div'>, 'children'>

export interface CardRootProps extends DivProps {
  /** The parts, in order: CardHeader, CardBody and CardFooter. Each one is optional. */
  children?: ReactNode | undefined
}

export interface CardHeaderProps extends DivProps {
  /** The title, in the heading element the page outline needs. */
  children?: ReactNode | undefined
}

export interface CardBodyProps extends DivProps {
  /** The text. Several paragraphs are spaced by the caller. */
  children?: ReactNode | undefined
}

export interface CardFooterProps extends DivProps {
  /** The actions, in a row that wraps when the card is narrow. */
  children?: ReactNode | undefined
}

/** A placeholder holds no content and cannot be taken out of hiding. */
export type CardSkeletonProps =
  Omit<ComponentPropsWithRef<'div'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
