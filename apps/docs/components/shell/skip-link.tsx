import { SKIP_LINK } from '../classes'

/** First in body, to #main, visible on focus. TODO(tc): SkipLink once the library ships it (docs-site S12). */
export function SkipLink({ label }: { label: string }) {
  return <a href="#main" className={SKIP_LINK}>{label}</a>
}
