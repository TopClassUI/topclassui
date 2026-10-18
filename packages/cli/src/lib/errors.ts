/** 0 done; 1 differences found or a file left because of local edits; 2 usage or detection; 3 the package manager. */
export const EXIT = { ok: 0, differs: 1, usage: 2, install: 3 } as const

export type ExitCode = (typeof EXIT)[keyof typeof EXIT]

/** An error the user can act on: its message is printed as it is, without a stack. */
export class CliError extends Error {
  constructor(
    message: string,
    readonly code: ExitCode = EXIT.usage,
  ) {
    super(message)
    this.name = 'CliError'
  }
}
