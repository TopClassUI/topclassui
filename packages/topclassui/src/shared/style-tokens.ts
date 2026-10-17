// R-5.2-5: `style` carries only --tc-* variables, and React's CSSProperties declares none.
declare module 'react' {
  interface CSSProperties {
    [token: `--tc-${string}`]: string | number | undefined
  }
}

export {}
