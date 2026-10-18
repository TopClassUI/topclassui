// R-5.2-5 on the site too: style sets --tc-* variables only, and React's types accept them.
declare module 'react' {
  interface CSSProperties {
    [token: `--tc-${string}`]: string | number | undefined
  }
}

export {}
