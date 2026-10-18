// "<n> states" on the Previewer: the elements directly inside the root a dummy/states.tsx returns.

/** Where the tag that opens at `from` ends, past any `>` inside braces or quotes. */
function tagEnd(source: string, from: number): number {
  let braces = 0
  let quote: string | null = null
  for (let i = from; i < source.length; i++) {
    const char = source[i]
    if (quote !== null) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'" || char === '`') quote = char
    else if (char === '{') braces++
    else if (char === '}') braces--
    else if (char === '>' && braces === 0) return i
  }
  return source.length
}

/** Counts the children of the returned root element; 0 when the file returns nothing countable. */
export function countStates(source: string): number {
  const start = source.lastIndexOf('return ')
  if (start === -1) return 0
  let depth = 0
  let count = 0
  for (let i = source.indexOf('<', start); i !== -1 && i < source.length; i = source.indexOf('<', i + 1)) {
    if (source[i + 1] === '/') {
      depth--
      if (depth === 0) return count
      continue
    }
    const end = tagEnd(source, i)
    const selfClosing = source[end - 1] === '/'
    if (depth === 1) count++
    if (!selfClosing) depth++
    i = end
  }
  return count
}
