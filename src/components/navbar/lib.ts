/** The element the URL's #fragment names, as the browser finds it: the id as written, then decoded. */
export function findHashTarget(doc: Document): HTMLElement | null {
  const fragment = doc.location.hash.slice(1)
  if (!fragment) return null
  const found = doc.getElementById(fragment)
  if (found) return found
  try {
    return doc.getElementById(decodeURIComponent(fragment))
  } catch {
    // A stray % is no escape: the fragment names nothing.
    return null
  }
}
