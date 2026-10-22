import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { CodeBlockSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type CodeBlockDesignProps = {
  [K in keyof CodeBlockSchemaInput]?: CodeBlockSchemaInput[K] | undefined
}

/** lang and title are the block's own; the HTML attributes of those names are not passed through. */
export interface CodeBlockProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'lang' | 'title'>, CodeBlockDesignProps {
  /** The code, as a template literal: every space and line break is kept, and this is what the button copies. */
  children: string
  /** The language, written as data-lang for a stylesheet or a script to read. Nothing here colours it. */
  lang?: string | undefined
  /** The file name in the header. It names the code region and the copy button. */
  title?: ReactNode | undefined
  /** Before the title, an element such as `<Svg icon={copy} />`. Defaults to the terminal-window icon; `null` draws none. */
  icon?: ReactNode | undefined
  /** The same code as nodes the caller coloured, for example with a highlighter at build time. Rendered in place of children. */
  highlighted?: ReactNode | undefined
  /** The built-in strings of the copy button. Defaults to English; pass `getLabels(locale).labels` for another. */
  labels?: Labels | undefined
  /** Accepted so `{...getLabels(locale)}` spreads cleanly. Nothing here formats a number, so it is not used and never reaches the element. */
  locale?: string | undefined
}

/** What the server half hands its button: the code and three strings, all plain values. Internal. */
export interface CodeBlockCopyProps {
  code: string
  /** The name of the button, which never changes. */
  label: string
  /** Said once the clipboard holds the code. */
  copied: string
  /** Said when the clipboard refuses or does not exist. */
  failed: string
  /** The id of the title, read after the button's own name: "Copy page.tsx". */
  titleId?: string | undefined
}
