'use client'

import { type DragEvent, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'

import { clamp } from '#shared/clamp.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
import { useLabels, useLocale, useNumberFormat } from '#shared/provider/context.js'
import { hasContent } from '#shared/render-trigger.js'
import { useFormValue } from '#shared/use-form-value.js'
import { useScrollTabStop } from '#shared/use-scroll-tab-stop.js'
import { FILE_UPLOAD_BOUNDARIES } from './boundaries.js'
import { FILE_UPLOAD_DEFAULTS } from './constants.js'
import { formatBytes, sortFiles } from './lib.js'
import type { FileUploadRow, FileUploadState, FileUploadStateProps } from './types.js'

const { maxFilesMin, maxFilesMax, maxSizeMin, maxSizeMax } = FILE_UPLOAD_BOUNDARIES
const { visibleRowsMin, visibleRowsMax } = COLLECTION_BOUNDARIES

/** The list nobody has touched, and the one a form reset returns to. */
const untouched: FileUploadState = { rows: [], cut: false, cuts: 0, fresh: false }

const keptFiles = (rows: readonly FileUploadRow[]) => rows.filter((row) => row.reason === null).map((row) => row.file)

/** The form sends exactly the list on screen: the input's own files are replaced by the kept ones. */
function writeFiles(input: HTMLInputElement | null, files: readonly File[]): void {
  if (!input) return
  const transfer = new DataTransfer()
  for (const file of files) transfer.items.add(file)
  input.files = transfer.files
}

/** After a reset the input holds the list's files, whether or not the browser emptied it itself. */
function syncFiles(value: FileUploadState, input: HTMLInputElement | null): void {
  writeFiles(input, keptFiles(value.rows))
}

/** A scripted write fires no event, so this one tells an app's listener and FieldLive. Not change: onChange reads that as a pick. */
function announceWrite(input: HTMLInputElement | null): void {
  input?.dispatchEvent(new Event('input', { bubbles: true }))
}

/** A dragged link or text is not a drop of files, and leaves the zone as it is. */
const carriesFiles = (event: DragEvent) => event.dataTransfer.types.includes('Files')

/** The list of a file upload, held with the form's reset; the limits, the drag look, the drop, the removes and what is announced. */
export function useFileUpload(props: FileUploadStateProps) {
  const { accept = '', disabled = false, hint, describedBy, onValueChange, ref } = props
  // R-5.7-7: a stray 0 or 1e12 never reaches the checks.
  const limits = {
    maxFiles: clamp(Math.floor(props.maxFiles ?? FILE_UPLOAD_DEFAULTS.maxFiles), maxFilesMin, maxFilesMax),
    maxSize: clamp(props.maxSize ?? FILE_UPLOAD_DEFAULTS.maxSize, maxSizeMin, maxSizeMax),
    accept,
  }
  const state = useFormValue({ defaultValue: untouched, sync: syncFiles })
  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef])
  const listRef = useRef(null as HTMLUListElement | null)
  const tabIndex = useScrollTabStop(listRef)
  const labels = useLabels().file
  const format = useNumberFormat()
  const locale = useLocale()
  const id = useId()
  const counter = useRef(0)
  const depth = useRef(0)
  const focusAt = useRef(null as number | null)
  const [dragging, setDragging] = useState(false)

  const add = (incoming: readonly File[]) => {
    const { rows } = state.value
    const sorted = sortFiles(keptFiles(rows), incoming, limits)
    const nextKey = () => { counter.current += 1; return String(counter.current) }
    const kept = sorted.accepted.map((file): FileUploadRow => rows.find((row) => row.file === file && row.reason === null) ?? { key: nextKey(), file, reason: null })
    const refused = sorted.rejected.map(({ file, reason }): FileUploadRow => ({ key: nextKey(), file, reason }))
    state.setValue({ rows: [...kept, ...refused], cut: sorted.cut, cuts: state.value.cuts + (sorted.cut ? 1 : 0), fresh: true })
    writeFiles(state.inputRef.current, sorted.accepted)
    onValueChange?.(sorted.accepted)
  }

  // Files picked before hydration are in the input already: they join the list as a pick would.
  const latestAdd = useRef(add)
  latestAdd.current = add
  useEffect(() => {
    const files = state.inputRef.current?.files
    if (files && files.length > 0) latestAdd.current([...files])
  }, [state.inputRef])

  const remove = (key: string) => {
    const { rows } = state.value
    const index = rows.findIndex((row) => row.key === key)
    const removed = rows[index]
    if (!removed) return
    const next = rows.filter((row) => row.key !== key)
    state.setValue({ rows: next, cut: false, cuts: state.value.cuts, fresh: false })
    focusAt.current = index
    if (removed.reason !== null) return
    const files = keptFiles(next)
    writeFiles(state.inputRef.current, files)
    announceWrite(state.inputRef.current)
    onValueChange?.(files)
  }

  // The removed row's button is gone: the next row's takes the focus, else the previous one's, else the input.
  useLayoutEffect(() => {
    const index = focusAt.current
    if (index === null) return
    focusAt.current = null
    const buttons = [...(listRef.current?.querySelectorAll('button') ?? [])]
    const target = buttons[index] ?? buttons[index - 1] ?? state.inputRef.current
    target?.focus()
  }, [state.value, state.inputRef])

  const onDragEnter = (event: DragEvent) => {
    if (!carriesFiles(event)) return
    event.preventDefault()
    depth.current += 1
    if (!disabled) setDragging(true)
  }
  // Prevented even when disabled, or the browser would open the dropped file in place of the page.
  const onDragOver = (event: DragEvent) => {
    if (!carriesFiles(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
    if (!disabled) setDragging(true)
  }
  // A child fires its own enter and leave, so the zone is left when the count is back at none.
  const onDragLeave = (event: DragEvent) => {
    if (!carriesFiles(event)) return
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setDragging(false)
  }
  const onDrop = (event: DragEvent) => {
    if (!carriesFiles(event)) return
    event.preventDefault()
    depth.current = 0
    setDragging(false)
    if (disabled) return
    add([...event.dataTransfer.files])
    announceWrite(state.inputRef.current)
  }

  const numbering = format.resolvedOptions().numberingSystem
  const rows = state.value.rows.map((row) => ({
    key: row.key,
    name: row.file.name,
    rejected: row.reason !== null,
    nameId: `${id}-${row.key}-name`,
    removeId: `${id}-${row.key}-remove`,
    note: row.reason === null ? formatBytes(row.file.size, locale, numbering) : labels[row.reason],
  }))
  const hintId = hasContent(hint) ? `${id}-hint` : undefined

  return {
    rootRef: state.rootRef,
    inputRef: state.inputRef,
    listRef,
    tabIndex,
    // Passed, it is set inline on the list; left out, React writes no style and the --tc-list-rows knob applies.
    listRows: props.visibleRows === undefined ? undefined : clamp(props.visibleRows, visibleRowsMin, visibleRowsMax),
    multiple: limits.maxFiles > 1,
    dragging,
    hintId,
    // The zone's hint first, then the caller's: a Field's hint and error.
    describedBy: [hintId, describedBy].filter(Boolean).join(' ') || undefined,
    labels,
    rows,
    refused: state.value.fresh ? rows.filter((row) => row.rejected) : [],
    message: state.value.cut ? labels.tooMany(limits.maxFiles, format) : '',
    messageKey: state.value.cuts,
    onChange: () => { add([...(state.inputRef.current?.files ?? [])]) },
    remove,
    zone: { onDragEnter, onDragOver, onDragLeave, onDrop },
  }
}
