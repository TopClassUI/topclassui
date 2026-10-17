// One slug function for the h2 ids and for toc.json, so the list and the ids cannot disagree.
const ARABIC_MARKS = /[ً-ٰٟـ]/g
const NOT_KEPT = /[^a-z0-9ء-غف-ي٠-٩ٱ-ۓ۰-۹]+/g

/** Lower-case Latin letters, digits and Arabic letters are kept; every other run becomes one hyphen. */
export function slugify(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(ARABIC_MARKS, '').replace(NOT_KEPT, '-').replace(/^-+|-+$/g, '')
}
