import 'react'

declare module 'react' {
  // R-5.2-5: the style prop sets only --tc-* variables, and those must type-check.
  interface CSSProperties {
    [variable: `--tc-${string}`]: string | undefined
  }
}
