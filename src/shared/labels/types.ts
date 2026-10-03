/** R-5.11-2: a label with a number is a function, because Arabic has six plural forms. */
export type CountLabel = (n: number, fmt: Intl.NumberFormat) => string

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
  }
}

/** Only the keys a consumer wants to change; everything else keeps its default. */
export type PartialLabels = {
  readonly [K in keyof Labels]?: Partial<Labels[K]>
}
