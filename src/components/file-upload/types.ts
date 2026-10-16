import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, Ref } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { FILE_UPLOAD_REASONS } from './constants.js'
import type { FileUploadSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type FileUploadDesignProps = {
  [K in keyof FileUploadSchemaInput]?: FileUploadSchemaInput[K] | undefined
}

/** Why a file was refused: it is over maxSize, or accept does not take it. */
export type FileUploadReason = (typeof FILE_UPLOAD_REASONS)[number]

/** R-5.6-1: the input draws no label of its own, so a caller names it one of three ways. */
export type FileUploadName = ControlName

/** maxFiles alone decides `multiple`; a file list cannot be set by a page, so there is no value pair; no size scale. */
type Owned = 'type' | 'multiple' | 'value' | 'defaultValue' | 'onChange' | 'size' | 'children' | 'className' | 'style'
  | 'id' | 'aria-label' | 'aria-labelledby'

// The rest reach the native input, not the root: a departure from R-5.7-3, as RadioGroupItem's.
export type FileUploadProps = Omit<ComponentPropsWithoutRef<'input'>, Owned>
  & FileUploadDesignProps
  & {
    /** The hint inside the zone, such as "PDF or PNG, up to 5 MB": it describes the input. */
    children?: ReactNode | undefined
    /** The accepted files after each pick, drop or remove. */
    onValueChange?: ((files: readonly File[]) => void) | undefined
    /** On the root, merged last. */
    className?: string | undefined
    /** On the root. */
    style?: CSSProperties | undefined
    /** The root element, a `<div>`. */
    ref?: Ref<HTMLDivElement> | undefined
  }
  & FileUploadName

/** What sortFiles is given: the clamped limits and the input's accept. */
export interface FileUploadLimits {
  maxFiles: number
  maxSize: number
  accept: string
}

/** A refused file and why. */
export interface FileUploadRejection {
  file: File
  reason: FileUploadReason
}

/** What one pick or drop leaves: the files kept, in order, the files refused, and whether maxFiles cut any. */
export interface FileUploadSorted {
  accepted: readonly File[]
  rejected: readonly FileUploadRejection[]
  cut: boolean
}

/** One row of the list: a kept file, or a file the latest change refused, with its reason. */
export interface FileUploadRow {
  key: string
  file: File
  reason: FileUploadReason | null
}

/** The list as the hook holds it: a form reset puts it back to empty. */
export interface FileUploadState {
  rows: readonly FileUploadRow[]
  /** The latest change cut files at maxFiles. */
  cut: boolean
  /** How many changes maxFiles has cut: each cut writes its message anew, so a second one in a row is heard too. */
  cuts: number
  /** The rejected rows came with the latest change, so the hidden status line reads them. */
  fresh: boolean
}

/** What the hook needs from the props. */
export interface FileUploadStateProps {
  maxFiles: number | undefined
  maxSize: number | undefined
  visibleRows: number | undefined
  accept: string | undefined
  disabled: boolean | undefined
  hint: ReactNode
  describedBy: string | undefined
  onValueChange: ((files: readonly File[]) => void) | undefined
  ref: Ref<HTMLDivElement> | undefined
}
