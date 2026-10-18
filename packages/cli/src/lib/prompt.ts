// Questions with a pre-filled answer. Without a terminal, under --yes or in CI, the answer is the default.
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'

export type Ask = (question: string, fallback: string) => Promise<string>

export const interactive = (yes: boolean, env: Record<string, string | undefined>, tty: boolean): boolean =>
  !yes && tty && (env.CI === undefined || env.CI === '' || env.CI === 'false')

export const terminalAsk: Ask = async (question, fallback) => {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const answer = (await rl.question(`${question} (${fallback}) `)).trim()
    return answer === '' ? fallback : answer
  } finally {
    rl.close()
  }
}

export const yes = (answer: string): boolean => /^(y|yes)$/i.test(answer.trim())
