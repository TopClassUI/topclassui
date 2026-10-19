import type { Labels } from './types.js'

export const en = {
  common: {
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    retry: 'Try again',
    loading: 'Loading',
    more: 'More',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    code: 'Code',
    search: 'Search',
    required: 'required',
    optional: 'optional',
  },
  state: {
    empty: 'Nothing here yet',
    emptyDescription: 'When there is something to show, it will appear here.',
    error: 'Something went wrong',
    errorDescription: 'The list could not be loaded.',
    loadingMore: 'Loading more',
  },
  collection: {
    results: (n, fmt) => (n === 1 ? '1 result' : `${fmt.format(n)} results`),
    selected: (n, fmt) => (n === 1 ? '1 selected' : `${fmt.format(n)} selected`),
    noResults: 'No results',
  },
  pagination: {
    label: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    first: 'First page',
    last: 'Last page',
    page: (n, fmt) => `Page ${fmt.format(n)}`,
    ofPages: (n, fmt) => `of ${fmt.format(n)}`,
    pageOf: (page, count, fmt) => `Page ${fmt.format(page)} of ${fmt.format(count)}`,
  },
  select: {
    placeholder: 'Select',
    open: 'Open the list',
  },
  dialog: {
    close: 'Close this dialog',
  },
  file: {
    drop: 'Drag files here or',
    browse: 'browse',
    remove: 'Remove',
    tooMany: (n, fmt) => (n === 1 ? 'Only 1 file allowed' : `Only ${fmt.format(n)} files allowed`),
    refusedMore: (n, fmt) => (n === 1 ? 'and 1 more file refused' : `and ${fmt.format(n)} more files refused`),
    tooLarge: 'Too large',
    wrongType: 'Not an accepted type',
  },
  breadcrumb: {
    label: 'Breadcrumb',
    home: 'Home',
  },
  avatar: {
    more: (n, fmt) => `${fmt.format(n)} more`,
  },
  rating: {
    value: (value, max, fmt) => `${fmt.format(value)} out of ${fmt.format(max)}`,
    stars: (n, fmt) => (n === 1 ? '1 star' : `${fmt.format(n)} stars`),
  },
  table: {
    sortBy: 'Sort by',
    sortedAscending: 'sorted ascending',
    sortedDescending: 'sorted descending',
  },
  timeline: {
    done: 'Done',
    current: 'Current',
    todo: 'Not started',
  },
  drawer: {
    close: 'Close this panel',
  },
  toast: {
    region: 'Notifications',
    close: 'Dismiss this notification',
  },
  command: {
    label: 'Command palette',
    placeholder: 'Type a command or search',
    escape: 'Esc',
    enter: 'Enter',
  },
  navbar: {
    label: 'Main',
  },
  sidebar: {
    label: 'Sidebar',
    collapse: 'Collapse the sidebar',
    expand: 'Expand the sidebar',
  },
  tag: {
    remove: 'Remove',
  },
  banner: {
    dismiss: 'Dismiss',
  },
  numberField: {
    increase: 'Increase',
    decrease: 'Decrease',
    field: 'Number field',
  },
  slider: {
    minimum: 'Minimum',
    maximum: 'Maximum',
  },
  otp: {
    character: (place, length, fmt) => `Character ${fmt.format(place)} of ${fmt.format(length)}`,
  },
  textarea: {
    count: (length, max, fmt) => `${fmt.format(length)} of ${fmt.format(max)} characters`,
  },
  datePicker: {
    placeholder: 'Pick a date',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
  },
  stepper: {
    done: 'Completed',
    todo: 'Not started',
    error: 'Needs attention',
  },
} satisfies Labels
