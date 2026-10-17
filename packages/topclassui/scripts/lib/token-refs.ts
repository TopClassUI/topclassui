// A misspelled custom property is silent: bg-(--tc-primry-soft) compiles and paints
// nothing. Nothing else in the toolchain can see it, so the names are checked here.

/** The first lookahead stops backtracking reporting '--tc-bran' for '--tc-brand:'. */
const REFERENCE = /--tc-[\w-]+(?![\w-])(?!\s*:)/g
const DECLARATION = /(--tc-[\w-]+)\s*:/g

export interface Reference { token: string; file: string; line: number }

export function definedTokens(tokensCss: string): Set<string> {
  return new Set([...tokensCss.matchAll(DECLARATION)].map((m) => m[1] ?? ''))
}

/** Every --tc-* a file reads that the tokens file never declares. */
export function findUndefinedReferences(
  defined: Set<string>,
  files: { file: string; content: string }[],
): Reference[] {
  const out: Reference[] = []
  for (const { file, content } of files) {
    content.split(/\r?\n/).forEach((text, index) => {
      for (const m of text.matchAll(REFERENCE)) {
        const token = m[0]
        if (!defined.has(token)) out.push({ token, file, line: index + 1 })
      }
    })
  }
  return out
}
