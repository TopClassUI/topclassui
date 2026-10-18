'use client'

import { Svg } from '#components/svg/index.js'
import { file as fileIcon } from '#icons/data/file.js'
import { uploadSimple } from '#icons/data/upload-simple.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { x } from '#icons/data/x.js'
import { cn } from '#shared/cn.js'
import {
  FILE_UPLOAD_ANNOUNCE, FILE_UPLOAD_BROWSE, FILE_UPLOAD_HINT, FILE_UPLOAD_ICON, FILE_UPLOAD_INPUT, FILE_UPLOAD_LIST,
  FILE_UPLOAD_MESSAGE, FILE_UPLOAD_NAME, FILE_UPLOAD_PROMPT, FILE_UPLOAD_REASON, FILE_UPLOAD_REJECTED_ICON,
  FILE_UPLOAD_REMOVE, FILE_UPLOAD_ROOT, FILE_UPLOAD_ROW, FILE_UPLOAD_ROW_ICON, FILE_UPLOAD_SIZE, FILE_UPLOAD_SPACER_END,
  FILE_UPLOAD_SPACER_START, FILE_UPLOAD_ZONE,
} from './classes.js'
import { FILE_UPLOAD_DEFAULTS } from './constants.js'
import { useFileUpload } from './hook.js'
import type { FileUploadProps } from './types.js'

/** A drop zone that is a native file input, so a click, a key or a drop picks files and the form sends them before
 * any script. Once hydrated it keeps a list that adds up across picks and drops, checks the limits, and writes the
 * kept files back into the input. className, style and ref reach the root; every other prop reaches the input. */
export function FileUpload({
  maxFiles,
  maxSize,
  visibleRows,
  invalid = FILE_UPLOAD_DEFAULTS.invalid,
  accept,
  disabled,
  onValueChange,
  className,
  style,
  ref,
  children,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: FileUploadProps) {
  const upload = useFileUpload({ maxFiles, maxSize, visibleRows, accept, disabled, hint: children, describedBy, onValueChange, ref })
  return (
    <div ref={upload.rootRef} style={style} className={cn(FILE_UPLOAD_ROOT, className)}>
      <div
        {...upload.zone}
        data-dragging={upload.dragging ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        className={FILE_UPLOAD_ZONE}
      >
        <span aria-hidden="true" className={FILE_UPLOAD_ICON}><Svg icon={uploadSimple} size="1.75rem" /></span>
        <span className={FILE_UPLOAD_PROMPT}>
          <span>{upload.labels.drop}</span>
          <span className={FILE_UPLOAD_BROWSE}>{upload.labels.browse}</span>
        </span>
        {upload.hintId === undefined ? null : <span id={upload.hintId} className={FILE_UPLOAD_HINT}>{children}</span>}
        <input
          // Blink falls back to "No file chosen", in the browser's language, only when title is absent; empty is not absent.
          title=""
          {...rest}
          ref={upload.inputRef}
          type="file"
          multiple={upload.multiple}
          accept={accept}
          disabled={disabled}
          aria-describedby={upload.describedBy}
          // A Field passes aria-invalid itself, so it survives when `invalid` is off.
          aria-invalid={invalid ? true : ariaInvalid}
          onChange={upload.onChange}
          className={FILE_UPLOAD_INPUT}
        />
      </div>
      <ul role="list" ref={upload.listRef} tabIndex={upload.tabIndex}
        style={{ '--tc-list-rows': upload.listRows, '--tc-list-pad-start': upload.padStart, '--tc-list-pad-end': upload.padEnd }}
        className={FILE_UPLOAD_LIST}
      >
        {upload.padStart === undefined ? null : <li aria-hidden="true" className={FILE_UPLOAD_SPACER_START} />}
        {upload.rows.map((row) => (
          <li key={row.key} data-index={row.index} className={FILE_UPLOAD_ROW}>
            <span aria-hidden="true" className={row.rejected ? FILE_UPLOAD_REJECTED_ICON : FILE_UPLOAD_ROW_ICON}>
              <Svg icon={row.rejected ? warningCircle : fileIcon} />
            </span>
            <span dir="auto" id={row.nameId} className={FILE_UPLOAD_NAME}>{row.name}</span>
            <span className={row.rejected ? FILE_UPLOAD_REASON : FILE_UPLOAD_SIZE}>{row.note}</span>
            <button
              type="button"
              id={row.removeId}
              aria-label={upload.labels.remove}
              aria-labelledby={`${row.removeId} ${row.nameId}`}
              disabled={disabled}
              className={FILE_UPLOAD_REMOVE}
              onClick={() => { upload.remove(row.key) }}
            >
              <Svg icon={x} />
            </button>
          </li>
        ))}
        {upload.padEnd === undefined ? null : <li aria-hidden="true" className={FILE_UPLOAD_SPACER_END} />}
      </ul>
      {/* A new node per cut: the same words written again into the same node change nothing, and are not heard. */}
      <div role="status" className={FILE_UPLOAD_MESSAGE}>{upload.message === '' ? null : <span key={upload.messageKey}>{upload.message}</span>}</div>
      <div role="status" className={FILE_UPLOAD_ANNOUNCE}>
        {upload.refused.map((row) => (
          <div key={row.key}><span dir="auto">{row.name}</span> <span>{row.note}</span></div>
        ))}
        {upload.refusedMore === '' ? null : <div>{upload.refusedMore}</div>}
      </div>
    </div>
  )
}
