// Stands in for Next's build/polyfills/polyfill-module (next.config.ts): the site's browsers have the rest, but URL.canParse came in Chrome 120 and Safari 17.
const url: { canParse?: (input: string | URL, base?: string | URL) => boolean } = URL

url.canParse ??= (input, base) => {
  try {
    new URL(input, base)
    return true
  } catch {
    return false
  }
}

export {}
