/** R-5.11-2: a label with a number is a function, because Arabic has six plural forms. */
export type CountLabel = (n: number, fmt: Intl.NumberFormat) => string

/** A value read against its maximum, "4 out of 5": two numbers, which a CountLabel cannot carry. */
export type RatioLabel = (value: number, max: number, fmt: Intl.NumberFormat) => string

/** Every built-in string a component can show. `satisfies Labels` makes a missing key a type error. */
export interface Labels {
  readonly common: {
    readonly close: string
    readonly cancel: string
    readonly confirm: string
    readonly retry: string
    readonly loading: string
    readonly more: string
    readonly clear: string
    readonly copy: string
    readonly copied: string
    /** Announced when the clipboard refuses a copy. */
    readonly copyFailed: string
    /** Names a block of code that has no title of its own, so its tab stop is never nameless. */
    readonly code: string
    readonly search: string
    readonly required: string
    readonly optional: string
  }
  readonly state: {
    readonly empty: string
    readonly emptyDescription: string
    readonly error: string
    readonly errorDescription: string
    readonly loadingMore: string
  }
  readonly collection: {
    readonly results: CountLabel
    readonly selected: CountLabel
    readonly noResults: string
  }
  readonly pagination: {
    readonly label: string
    readonly previous: string
    readonly next: string
    readonly first: string
    readonly last: string
    readonly page: CountLabel
    readonly ofPages: CountLabel
    /** The current page and the count in one label, so a language orders the two its own way. */
    readonly pageOf: RatioLabel
  }
  readonly select: {
    readonly placeholder: string
    readonly open: string
  }
  readonly dialog: {
    readonly close: string
  }
  readonly file: {
    readonly drop: string
    readonly browse: string
    readonly remove: string
    readonly tooMany: CountLabel
    /** After the first refused names, the count of the rest, so ten thousand refusals are not all read out. */
    readonly refusedMore: CountLabel
    /** The reasons on a rejected file's row, beside its name. */
    readonly tooLarge: string
    readonly wrongType: string
  }
  readonly breadcrumb: {
    readonly label: string
    readonly home: string
  }
  readonly avatar: {
    readonly more: CountLabel
  }
  readonly rating: {
    readonly value: RatioLabel
    /** The name of one step of an editable rating, "3 stars". */
    readonly stars: CountLabel
  }
  readonly table: {
    readonly sortBy: string
    readonly sortedAscending: string
    readonly sortedDescending: string
  }
  /** The status of a Timeline item, read out where a sighted reader sees the marker. */
  readonly timeline: {
    readonly done: string
    readonly current: string
    readonly todo: string
  }
  readonly drawer: {
    readonly close: string
  }
  readonly toast: {
    readonly region: string
    readonly close: string
  }
  readonly command: {
    readonly label: string
    readonly placeholder: string
  }
  readonly navbar: {
    readonly label: string
  }
  readonly sidebar: {
    readonly label: string
    readonly collapse: string
    readonly expand: string
  }
  readonly tag: {
    readonly remove: string
  }
  readonly banner: {
    readonly dismiss: string
  }
  readonly numberField: {
    readonly increase: string
    readonly decrease: string
    /** The role description of the input, read where a sighted reader sees the two steppers. */
    readonly field: string
  }
  /** The names of the two thumbs of a range; a single thumb takes the slider's own name. */
  readonly slider: {
    readonly minimum: string
    readonly maximum: string
  }
  readonly otp: {
    /** The name of one cell after the first, "Character 2 of 6". */
    readonly character: RatioLabel
  }
  readonly textarea: {
    /** The count of a textarea against its cap, "42 of 500 characters". */
    readonly count: RatioLabel
  }
  /** The trigger with no value and the names of the two month buttons; month and weekday names come from Intl. */
  readonly datePicker: {
    readonly placeholder: string
    readonly previousMonth: string
    readonly nextMonth: string
  }
  /** The status of a step, read out after its title where a sighted reader sees the marker. */
  readonly stepper: {
    readonly done: string
    readonly todo: string
    readonly error: string
  }
}

/** Only the keys a consumer wants to change; everything else keeps its default. */
export type PartialLabels = {
  readonly [K in keyof Labels]?: Partial<Labels[K]>
}
