// The mutations of src/components/breadcrumb. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a breadcrumb label holding </script> closes the JSON-LD script tag and the rest is parsed as HTML',
    file: 'src/components/breadcrumb/lib.ts',
    from: ".replace(/</g, '\\\\u003c')",
    to: '',
  },
  {
    label: 'the breadcrumb JSON-LD lists the current page too, as a ListItem with no URL',
    file: 'src/components/breadcrumb/lib.ts',
    from: 'items.filter((item) => item.href !== undefined)',
    to: 'items',
  },
  {
    label: 'the last breadcrumb crumb is no longer marked aria-current, so nothing says which page this is',
    file: 'src/components/breadcrumb/index.tsx',
    from: "aria-current={current ? 'page' : undefined} ",
    to: '',
  },
  {
    label: 'a breadcrumb link loses its touch target, so it is a 20 px line of text again',
    file: 'src/components/breadcrumb/classes.ts',
    from: '  TOUCH_TARGET,\n',
    to: '',
  },
  {
    label: 'the breadcrumb caret stops flipping, so it points against the trail under dir="rtl"',
    file: 'src/components/breadcrumb/index.tsx',
    from: '<Svg icon={caretRight} />',
    to: '<Svg icon={caretRight} flipRtl={false} />',
  },
  {
    label: 'the breadcrumb nav is named in English whatever labels the caller passes',
    file: 'src/components/breadcrumb/index.tsx',
    from: '? labels.breadcrumb.label : ariaLabel',
    to: '? en.breadcrumb.label : ariaLabel',
  },
  {
    label: 'an empty breadcrumb aria-label is written as given, so the landmark has no name, though pagination falls back for the same input',
    file: 'src/components/breadcrumb/index.tsx',
    from: "ariaLabel === undefined || ariaLabel === '' ? labels.breadcrumb.label",
    to: 'ariaLabel === undefined ? labels.breadcrumb.label',
  },
  {
    label: 'a breadcrumb aria-label a wrapper forwards as undefined strips the name of the landmark',
    file: 'src/components/breadcrumb/index.tsx',
    from: "ariaLabel === undefined || ariaLabel === '' ? labels.breadcrumb.label",
    to: "ariaLabel === '' ? labels.breadcrumb.label",
  },
  {
    label: 'a breadcrumb crumb ignores the link element, so every click in a Next.js app reloads the document',
    file: 'src/components/breadcrumb/index.tsx',
    from: "renderLink('Breadcrumb', link, item.href,",
    to: "renderLink('Breadcrumb', undefined, item.href,",
  },
  {
    label: 'a breadcrumb crumb with an empty label is rendered again, as a link with no name',
    file: 'src/components/breadcrumb/index.tsx',
    from: "items.filter((item) => typeof item.label === 'string' && item.label.trim() !== '')",
    to: 'items',
  },
  {
    label: 'a breadcrumb crumb with a null label throws again, and the page holding the trail fails to render',
    file: 'src/components/breadcrumb/index.tsx',
    from: "typeof item.label === 'string' && item.label.trim() !== ''",
    to: "item.label.trim() !== ''",
  },
  {
    label: 'a breadcrumb label of spaces counts as a name, so the trail holds a link nobody can see',
    file: 'src/components/breadcrumb/index.tsx',
    from: "item.label.trim() !== ''",
    to: "item.label !== ''",
  },
  {
    label: 'the breadcrumb baseUrl is ignored, so the JSON-LD lists relative URLs whatever the caller passes',
    file: 'src/components/breadcrumb/lib.ts',
    from: 'return new URL(href, baseUrl).href',
    to: 'return href',
  },
  {
    label: 'a breadcrumb baseUrl that is not a URL throws, and the page holding the trail fails to render',
    file: 'src/components/breadcrumb/lib.ts',
    from: '  } catch {\n    return href\n  }',
    to: '  } finally {\n    void href\n  }',
  },
  {
    label: 'the breadcrumb caret sets its own colour again, which forced colours keep as a grey on black',
    file: 'src/components/breadcrumb/index.tsx',
    from: '<Svg icon={caretRight} />',
    to: '<Svg icon={caretRight} className="text-muted" />',
  },
  {
    label: 'the breadcrumb current page loses its weight, so only colour tells it from a link',
    file: 'src/components/breadcrumb/classes.ts',
    from: 'text-body font-semibold`',
    to: 'text-body`',
  },
  {
    label: 'a breadcrumb forwards locale to its nav again, so a spread of getLabels writes an attribute HTML does not have',
    file: 'src/components/breadcrumb/index.tsx',
    from: '  locale: _locale,\n',
    to: '',
  },
  {
    label: 'the breadcrumb current page cuts its label with a slice of its own again, splitting an Arabic letter from its harakat',
    file: 'src/components/breadcrumb/index.tsx',
    from: '{cutLabel(item.label, max)}',
    to: '{item.label.slice(0, max)}',
  },
  {
    label: 'the breadcrumb current page loses its dir, so an English-first label in an RTL page is cut at its start',
    file: 'src/components/breadcrumb/index.tsx',
    from: '<span dir={resolveLabelDir(item.label)} aria-current',
    to: '<span aria-current',
  },
  {
    label: 'the breadcrumb current page takes dir="auto" again, so "Wi-Fi متصل" reads Wi-Fi last in an Arabic page',
    file: 'src/components/breadcrumb/index.tsx',
    from: '<span dir={resolveLabelDir(item.label)} aria-current',
    to: '<span dir="auto" aria-current',
  },
]
