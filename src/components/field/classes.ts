// R-5.12-4: Field's own class strings, as unit-5.md gives them. The control inside brings its own look.

/** min-w-0: a long label wraps instead of widening a grid track. */
export const FIELD_ROOT = 'grid min-w-0 content-start'
/** One column: the label, the control, the hint, the error. */
export const FIELD_STACK = 'grid-cols-1 gap-1.5'
/** inline: the control first and the label beside it; the hint and the error under the label. */
export const FIELD_INLINE = 'grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1'
export const FIELD_LABEL = 'text-sm font-medium text-body wrap-anywhere'
export const FIELD_LABEL_INLINE = 'col-start-2 row-start-1 font-normal'
export const FIELD_CONTROL = 'min-w-0'
export const FIELD_CONTROL_INLINE = 'col-start-1 row-start-1 flex'
export const FIELD_HINT = 'text-sm text-muted wrap-anywhere'
/** A mark as well as a colour (SC 1.4.1): the icon is what a reader of greys keeps. */
export const FIELD_ERROR = 'flex items-start gap-1.5 text-sm text-danger-on-soft wrap-anywhere'
/** As tall as the first line of the message, so the icon centres on it. */
export const FIELD_ERROR_ICON = 'flex h-5 shrink-0 items-center'
export const FIELD_NOTE_INLINE = 'col-start-2'
/** The asterisk of a required field. Colour goes on the wrapper, never on the svg. */
export const FIELD_REQUIRED = 'ms-0.5 inline-flex text-danger-on-soft'
