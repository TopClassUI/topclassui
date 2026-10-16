'use client'

import { Select as Base } from '@base-ui/react/select'

import { caretDown } from '#icons/data/caret-down.js'
import { check } from '#icons/data/check.js'
import { FIELD_HOLDER_FULL, FIELD_SIZE, FIELD_TEXT } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { POPUP_BOUNDS, toSideAlign } from '#shared/floating.js'
import { Svg } from '#components/svg/index.js'
import {
  SELECT_ICON, SELECT_ITEM, SELECT_ITEM_TEXT, SELECT_ITEM_TICK, SELECT_LIST, SELECT_POPUP, SELECT_POSITIONER, SELECT_ROOT,
  SELECT_TRIGGER, SELECT_VALUE,
} from './classes.js'
import { SELECT_DEFAULTS } from './constants.js'
import { useSelect } from './hook.js'
import type { SelectProps } from './types.js'

/** A select-only combobox that takes its options as data, so a server page can render one. The trigger sits in a box
 * that owns the width; its value follows a form reset, and its list opens in a portal under it, inside the screen. */
export function Select({
  items,
  size = SELECT_DEFAULTS.size,
  invalid = SELECT_DEFAULTS.invalid,
  fullWidth = SELECT_DEFAULTS.fullWidth,
  placement = SELECT_DEFAULTS.placement,
  visibleRows,
  placeholder,
  container,
  value,
  defaultValue,
  onValueChange,
  onOpenChange,
  inputRef,
  id, name, form, autoComplete, required, readOnly, disabled, modal, highlightItemOnHover,
  open, defaultOpen, onOpenChangeComplete, actionsRef,
  className,
  ref,
  'aria-invalid': ariaInvalid,
  ...rest
}: SelectProps) {
  const select = useSelect({
    value, defaultValue, onValueChange, onOpenChange, inputRef, visibleRows, placeholder, ref,
    'aria-label': rest['aria-label'], 'aria-labelledby': rest['aria-labelledby'],
  })
  const { side, align } = toSideAlign(placement)
  // Base UI never gets a default: the hook holds the value, so a form reset can bring it back.
  return (
    <Base.Root
      items={items}
      value={select.value}
      onValueChange={select.onValueChange}
      onOpenChange={select.onOpenChange}
      inputRef={select.inputRef}
      id={id} name={name} form={form} autoComplete={autoComplete} required={required} readOnly={readOnly} disabled={disabled}
      modal={modal} highlightItemOnHover={highlightItemOnHover} open={open} defaultOpen={defaultOpen}
      onOpenChangeComplete={onOpenChangeComplete} actionsRef={actionsRef}
    >
      <span className={cn(SELECT_ROOT, FIELD_TEXT[size], fullWidth && FIELD_HOLDER_FULL)}>
        <Base.Trigger
          {...rest}
          ref={select.triggerRef}
          // A Field passes aria-invalid itself, so it survives when `invalid` is off.
          aria-invalid={invalid ? true : ariaInvalid}
          data-size={size}
          className={cn(SELECT_TRIGGER, FIELD_SIZE[size], className)}
        >
          <Base.Value className={SELECT_VALUE} placeholder={select.placeholder} />
          <Base.Icon className={SELECT_ICON}><Svg icon={caretDown} size="0.875rem" /></Base.Icon>
        </Base.Trigger>
      </span>
      <Base.Portal container={container}>
        <Base.Positioner
          dir={select.dir}
          lang={select.lang}
          side={side}
          align={align}
          sideOffset={POPUP_BOUNDS.sideOffset}
          collisionPadding={POPUP_BOUNDS.collisionPadding}
          alignItemWithTrigger={false}
          className={SELECT_POSITIONER}
        >
          <Base.Popup data-select={select.scope} data-placement={placement} className={SELECT_POPUP}>
            <Base.List
              aria-label={select.listLabel}
              aria-labelledby={select.listLabelledBy}
              className={SELECT_LIST}
              style={{ '--tc-list-rows': select.rows }}
            >
              {items.map((item) => (
                <Base.Item key={item.value} value={item.value} label={item.label} disabled={item.disabled} className={SELECT_ITEM}>
                  <Base.ItemText className={SELECT_ITEM_TEXT}>{item.label}</Base.ItemText>
                  <Base.ItemIndicator className={SELECT_ITEM_TICK}><Svg icon={check} size="0.875rem" /></Base.ItemIndicator>
                </Base.Item>
              ))}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  )
}
