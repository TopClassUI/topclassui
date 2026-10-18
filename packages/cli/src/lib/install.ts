// Plan 3.3 "npm packages": one install command at the end, for the packages the copies need and the app lacks.
import { spawn } from 'node:child_process'
import { posix } from 'node:path'

import type { PackageManager, Project } from './detect.js'
import { installedVersion } from './detect.js'
import type { Files } from './files.js'
import { satisfies } from './semver.js'

/** `name@range` for each package the app does not already have at a satisfying version. */
export function missingPackages(
  files: Files,
  project: Pick<Project, 'root' | 'deps'>,
  wanted: Iterable<string>,
  ranges: Record<string, string>,
): string[] {
  const out: string[] = []
  for (const name of [...new Set(wanted)].sort()) {
    const range = ranges[name]
    if (range === undefined) continue
    const declared = project.deps[name]
    const installed = declared === undefined ? null : installedVersion(files, project.root, name, declared)
    if (installed !== null && satisfies(installed, range)) continue
    out.push(`${name}@${range}`)
  }
  return out
}

export function installCommand(pm: PackageManager, packages: string[]): [string, string[]] {
  return [pm, [pm === 'npm' ? 'install' : 'add', ...packages]]
}

export const printable = ([cmd, args]: [string, string[]]): string => [cmd, ...args].join(' ')

/** Runs the package manager in the project, inheriting the terminal; resolves to its exit code. */
export function runCommand(cmd: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: posix.normalize(cwd), stdio: 'inherit', shell: process.platform === 'win32' })
    child.on('error', () => {
      resolve(127)
    })
    child.on('exit', (code) => {
      resolve(code ?? 1)
    })
  })
}
