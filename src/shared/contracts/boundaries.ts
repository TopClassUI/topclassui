// R-8.3-2: values only, so nothing that reads a limit pulls zod into the bundle.

/** R-5.7-8: the default cap per input type, so the developer who never considered
 * it is still protected. Every number is far above any real value of that type. */
export const TEXT_MAX_LENGTH = {
  /** The fallback for a plain text field. A name or a street address is under 100. */
  text: 512,
  /** RFC 5321 section 4.5.3.1.3: the longest address a server must accept. */
  email: 254,
  /** The shortest practical browser URL ceiling, from IE's 2083. */
  url: 2048,
  /** E.164 allows 15 digits; the rest is country code, spaces and punctuation. */
  tel: 32,
  /** A query, not a document. */
  search: 256,
  /** bcrypt ignores everything past 72, so this is already generous. */
  password: 256,
  /** An essay fits; a pasted file does not. */
  textarea: 5000,
} as const

export type TextFieldType = keyof typeof TEXT_MAX_LENGTH

/** The cap for a field of this type, or the text fallback for anything else. */
export function maxLengthFor(type: string | undefined): number {
  const known = type as TextFieldType | undefined
  return known !== undefined && known in TEXT_MAX_LENGTH
    ? TEXT_MAX_LENGTH[known]
    : TEXT_MAX_LENGTH.text
}

/** The cap a field uses: the caller's, then the type's default, and `null` opts
 * out. A number field never calls this; it uses `min`, `max` and `step`. */
export function resolveMaxLength(
  given: number | null | undefined,
  type?: string,
): number | undefined {
  if (given === null) return undefined
  return given ?? maxLengthFor(type)
}

/** How close to the cap a counter appears. A cap nobody can see surprises someone
 * at the worst moment. */
export const COUNTER_THRESHOLD = 0.9
