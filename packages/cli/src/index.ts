#!/usr/bin/env node
// The bin: everything else is in main.ts, so a test runs the same code against a temp folder.
import { nodeContext } from './context.js'
import { main } from './main.js'

// `npx topclassui list | head` closes the pipe early; that is not an error.
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EPIPE') process.exit(0)
  throw error
})

main(process.argv.slice(2), nodeContext()).then(
  (code) => {
    process.exitCode = code
  },
  (error: unknown) => {
    console.error(error)
    process.exitCode = 1
  },
)
