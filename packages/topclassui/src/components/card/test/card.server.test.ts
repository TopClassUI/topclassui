import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  hasLateUseClient, hasUseClient, importedModules, importedNames, memberHookCalls, namespaceNamesOf,
} from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')

/** check-boundaries applies R-5.1-1 to index.tsx only, so the skeleton and every file in parts/ are read here. */
const SERVER_FILES = [...readdirSync(join(FOLDER, 'parts')).map((file) => `parts/${file}`), 'skeleton.tsx']

/** Every name the file imports from any module, so a hook from #shared counts as well. */
const namesImported = (source: string) => importedModules(source).flatMap((module) =>
  importedNames(source, module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

const isHook = (name: string) => name === 'use' || /^use[A-Z]/.test(name)

describe('every part renders on the server and ships no JavaScript', () => {
  for (const file of SERVER_FILES) {
    const source = readFileSync(join(FOLDER, file), 'utf8')

    it(`${file} has no 'use client', first or late`, () => {
      expect(hasUseClient(source), file).toBe(false)
      expect(hasLateUseClient(source), file).toBe(false)
    })

    it(`${file} imports no hook, named or through a React namespace`, () => {
      const hooks = [
        ...namesImported(source),
        ...memberHookCalls(source, namespaceNamesOf(source, 'react')),
      ].filter(isHook)
      expect(hooks, file).toEqual([])
    })

    it(`${file} imports nothing from Base UI, whose parts are client modules`, () => {
      expect(importedModules(source).filter((m) => m.startsWith('@base-ui/')), file).toEqual([])
    })
  }
})

describe('the scan itself', () => {
  it('sees a hook imported from react and one from a shared module', () => {
    const probe = "import { useState } from 'react'\nimport { useControllableState } from '#shared/use-controllable-state.js'\n"
    expect(namesImported(probe).filter(isHook)).toEqual(['useState', 'useControllableState'])
  })

  it('sees a hook reached through a namespace import', () => {
    const probe = "import * as React from 'react'\nconst [a] = React.useState(0)\n"
    expect(memberHookCalls(probe, namespaceNamesOf(probe, 'react')).filter(isHook)).toEqual(['useState'])
  })
})
