import { THEME_SCRIPT } from './script.js'

export { BUILT_IN_MODES, THEME_SCRIPT, THEME_STORAGE_KEY } from './script.js'
export type { BuiltInMode } from './script.js'

/**
 * First in `<head>`, with `suppressHydrationWarning` on `<html>`. React leaves an
 * inline script in place, so the browser runs it while parsing.
 */
export function ThemeScript({ nonce }: { nonce?: string | undefined }) {
  return (
    <script
      type="text/javascript"
      suppressHydrationWarning
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  )
}
