'use client'

import { Combobox as Base } from '@base-ui/react/combobox'

import { caretDown } from '#icons/data/caret-down.js'
import { spinner } from '#icons/data/spinner.js'
import { FIELD_SIZE, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { POPUP_BOUNDS, toSideAlign } from '#shared/floating.js'
import { Svg } from '#components/svg/index.js'
import {
  COMBOBOX_ICON, COMBOBOX_INPUT, COMBOBOX_INPUT_END, COMBOBOX_NOTE, COMBOBOX_POPUP, COMBOBOX_POSITIONER, COMBOBOX_ROOT,
  COMBOBOX_SPIN, COMBOBOX_WIDTH,
} from './classes.js'
import { COMBOBOX_DEFAULTS } from './constants.js'
import { useCombobox } from './hook.js'
import { ComboboxList } from './parts/combobox-list.js'
import type { ComboboxProps } from './types.js'

/** A text input that filters a list of options as you type; the chosen value is what the form receives. The input
 * keeps the focus and the highlight moves by aria-activedescendant, also onto a row the window has not mounted. */
export function Combobox({
  items, value, defaultValue, onValueChange, onItemHighlighted, inputRef,
  name, form, id, required, readOnly, disabled, defaultOpen, open, onOpenChange, onOpenChangeComplete,
  openOnInputClick, autoHighlight, highlightItemOnHover, loopFocus, inputValue, onInputValueChange,
  defaultInputValue, actionsRef, filter, modal, autoComplete, locale,
  size = COMBOBOX_DEFAULTS.size,
  invalid = COMBOBOX_DEFAULTS.invalid,
  fullWidth = COMBOBOX_DEFAULTS.fullWidth,
  placement = COMBOBOX_DEFAULTS.placement,
  virtualize = COMBOBOX_DEFAULTS.virtualize,
  hasMore = COMBOBOX_DEFAULTS.hasMore,
  status = COMBOBOX_DEFAULTS.status,
  visibleRows, loadMore, loadMoreThreshold, maxLength, emptyFallback, container, keepMounted, className, ref,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...rest
}: ComboboxProps) {
  const combobox = useCombobox({
    items, value, defaultValue, onValueChange, onItemHighlighted, open, defaultOpen, onOpenChange, inputRef, ref, maxLength,
    visibleRows, loadMoreThreshold, status, emptyFallback, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby,
  })
  const { side, align } = toSideAlign(placement)
  return (
    <span className={cn(COMBOBOX_ROOT, FIELD_TEXT[size], fullWidth ? COMBOBOX_WIDTH.full : COMBOBOX_WIDTH.own)}>
      <Base.Root
        items={combobox.items}
        value={combobox.value}
        onValueChange={combobox.onValueChange}
        onItemHighlighted={combobox.onItemHighlighted}
        inputRef={combobox.inputRef}
        virtualized
        name={name}
        form={form}
        id={id}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={combobox.onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
        openOnInputClick={openOnInputClick}
        autoHighlight={autoHighlight}
        highlightItemOnHover={highlightItemOnHover}
        loopFocus={loopFocus}
        inputValue={inputValue}
        onInputValueChange={onInputValueChange}
        defaultInputValue={defaultInputValue}
        actionsRef={actionsRef}
        filter={filter}
        modal={modal}
        autoComplete={autoComplete}
        locale={locale}
      >
        <Base.Input
          {...rest}
          ref={combobox.ref}
          aria-label={combobox.label}
          aria-labelledby={ariaLabelledby}
          maxLength={combobox.maxLength}
          // A Field passes aria-invalid itself, so it survives when `invalid` is off.
          aria-invalid={invalid ? true : ariaInvalid}
          aria-busy={combobox.busy || undefined}
          data-size={size}
          className={cn(COMBOBOX_INPUT, FIELD_SIZE[size], COMBOBOX_INPUT_END, className)}
        />
        <span aria-hidden className={COMBOBOX_ICON}>
          {combobox.spinning
            ? <span className={COMBOBOX_SPIN}><Svg icon={spinner} size="0.875rem" /></span>
            : <Svg icon={caretDown} size="0.875rem" />}
        </span>
        <Base.Portal container={container} keepMounted={keepMounted}>
          <Base.Positioner
            dir={combobox.dir}
            lang={combobox.lang}
            side={side}
            align={align}
            sideOffset={POPUP_BOUNDS.sideOffset}
            collisionPadding={POPUP_BOUNDS.collisionPadding}
            className={COMBOBOX_POSITIONER}
          >
            <Base.Popup data-placement={placement} className={COMBOBOX_POPUP}>
              <Base.Empty className={COMBOBOX_NOTE}>{combobox.empty}</Base.Empty>
              <ComboboxList
                scroller={combobox.scroller}
                virtualize={virtualize}
                hasMore={hasMore}
                open={combobox.open}
                loaded={combobox.loaded}
                loadMore={loadMore}
                loadMoreThreshold={combobox.loadMoreThreshold}
                rows={combobox.rows}
                selected={combobox.value}
              />
              <Base.Status className={COMBOBOX_NOTE}>{combobox.note}</Base.Status>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
    </span>
  )
}
