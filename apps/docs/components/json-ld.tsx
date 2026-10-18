import type { Thing, WithContext } from 'schema-dts'

/** Structured data, serialised with `<` escaped so a string can never close the script (docs-site S6). */
export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
