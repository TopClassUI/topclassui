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
  },
  select: {
    placeholder: 'Select',
    open: 'Open the list',
  },
  dialog: {
    close: 'Close this dialog',
  },
  file: {
    drop: 'Drop files here',
    browse: 'Browse',
    remove: 'Remove',
    tooMany: (n, fmt) => (n === 1 ? 'Only 1 file allowed' : `Only ${fmt.format(n)} files allowed`),
  },
} satisfies Labels
