// The three helpers every component's server-render test needs, in one place
// rather than copied into 46 folders.
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export const markup = (element: ReactElement): string => renderToStaticMarkup(element)

/** Anchored, or `id="x"` also matches inside `data-testid="x"`. */
export const attr = (html: string, name: string): string | undefined =>
  new RegExp(`(?:^|[ ])${name}="([^"]*)"`).exec(html)?.[1]

export const classList = (html: string): string[] =>
  (attr(html, 'class') ?? '').split(/\s+/).filter(Boolean)
