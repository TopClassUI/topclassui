import type { ComponentPropsWithRef, ReactElement } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { Size } from '#shared/contracts/size.js'
import type { TextareaSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type TextareaDesignProps = {
  [K in Exclude<keyof TextareaSchemaInput, 'maxLength'>]?: TextareaSchemaInput[K] | undefined
}

/** R-5.6-1: a textarea draws no text that names it, so a caller names it one of three ways. */
export type TextareaName = ControlName

/** Its value is `value` or `defaultValue`, never children; rows are clamped and the cap widened to take null. */
type Owned = 'children' | 'dangerouslySetInnerHTML' | 'rows' | 'maxLength'

export type TextareaProps =
  Omit<ComponentPropsWithRef<'textarea'>, Owned>
  & TextareaDesignProps
  & {
    /** The character cap: your number, 5000 by default, or `null` for none. */
    maxLength?: number | null | undefined
  }
  & TextareaName

/** R-8.3-4: the control's own size, width and rows, so the two cannot describe different boxes. */
export type TextareaSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<TextareaDesignProps, 'size' | 'fullWidth' | 'rows'>

/** What crosses from the server half to the holder: plain values and the one textarea element. */
export interface TextareaFieldProps {
  size: Size
  fullWidth: boolean
  /** Clamped already, as are maxRows and cap. */
  rows: number
  maxRows: number
  autosize: boolean
  showCount: boolean
  /** The resolved maxLength, or null when there is none. */
  cap: number | null
  counterId: string
  /** The length of the text as the server saw it, so the first client render prints the same count. */
  length: number
  children: ReactElement
}

/** What the holder's hook reads. */
export type TextareaFieldValueProps = Pick<TextareaFieldProps, 'rows' | 'maxRows' | 'autosize' | 'showCount' | 'cap' | 'length'>
