import { describe, expect, it } from 'vitest'

import {
  consumerManifest, consumerPort, missingProbes, newestTarball, parseArgs, runsFor, serverCommand, stepTitles,
} from './consumer-smoke.js'

describe('runsFor', () => {
  it('runs the Next template twice and the Vite template once, in that order', () => {
    expect(runsFor(null).map((r) => r.name)).toEqual(['next-latest', 'vite', 'next-floors'])
  })

  it('only the floors run swaps versions', () => {
    expect(runsFor(null).map((r) => r.floors)).toEqual([false, false, true])
  })

  it('--only picks by substring', () => {
    expect(runsFor('floors').map((r) => r.name)).toEqual(['next-floors'])
    expect(runsFor('next').map((r) => r.name)).toEqual(['next-latest', 'next-floors'])
  })

  it('an unknown name is an error, never an empty run', () => {
    expect(() => runsFor('nuxt')).toThrow('no run matches "nuxt"')
  })
})

describe('parseArgs', () => {
  it('defaults to a full, real run', () => {
    expect(parseArgs([])).toEqual({ dry: false, keep: false, only: null, tarball: null })
  })

  it('reads every flag', () => {
    expect(parseArgs(['--dry', '--keep', '--only', 'vite', '--tarball', '.pack/topclassui-0.1.0-beta.0.tgz'])).toEqual({
      dry: true, keep: true, only: 'vite', tarball: '.pack/topclassui-0.1.0-beta.0.tgz',
    })
  })

  it('a flag that needs a value fails without one', () => {
    expect(() => parseArgs(['--only'])).toThrow('--only needs a value')
    expect(() => parseArgs(['--tarball', '--dry'])).toThrow('--tarball needs a value')
  })

  it('an unknown argument fails rather than being ignored', () => {
    expect(() => parseArgs(['--fast'])).toThrow('unknown argument "--fast"')
  })
})

describe('consumerPort', () => {
  it('is 4625 unless the environment says otherwise', () => {
    expect(consumerPort({})).toBe(4625)
    expect(consumerPort({ TC_CONSUMER_PORT: '' })).toBe(4625)
    expect(consumerPort({ TC_CONSUMER_PORT: '4700' })).toBe(4700)
  })

  it('rejects a value that is not a port', () => {
    expect(() => consumerPort({ TC_CONSUMER_PORT: '80' })).toThrow('is not a port')
    expect(() => consumerPort({ TC_CONSUMER_PORT: 'next' })).toThrow('is not a port')
  })
})

describe('consumerManifest', () => {
  const template = {
    name: 'topclassui-consumer-next',
    dependencies: { next: '16.4.2', react: '19.3.1' },
    devDependencies: { tailwindcss: '4.3.3', typescript: '6.0.3' },
  }

  it('adds the library from the local tarball and keeps every pin', () => {
    expect(consumerManifest(template, {})).toEqual({
      name: 'topclassui-consumer-next',
      dependencies: { next: '16.4.2', react: '19.3.1', topclassui: 'file:./topclassui.tgz' },
      devDependencies: { tailwindcss: '4.3.3', typescript: '6.0.3' },
    })
  })

  it('swaps a floor into whichever list pins the package', () => {
    expect(consumerManifest(template, { next: '15.5.28', tailwindcss: '4.2.0' })).toEqual({
      name: 'topclassui-consumer-next',
      dependencies: { next: '15.5.28', react: '19.3.1', topclassui: 'file:./topclassui.tgz' },
      devDependencies: { tailwindcss: '4.2.0', typescript: '6.0.3' },
    })
  })

  it('a floor for a package the template does not pin is an error', () => {
    expect(() => consumerManifest(template, { vite: '8.3.4' })).toThrow('floors.json names "vite"')
  })

  it('a template that lists topclassui is an error: it must come from the tarball', () => {
    expect(() => consumerManifest({ dependencies: { topclassui: '0.1.0' } }, {})).toThrow('must not list topclassui')
  })

  it('does not change the template object it was given', () => {
    consumerManifest(template, { next: '15.5.28' })
    expect(template.dependencies).toEqual({ next: '16.4.2', react: '19.3.1' })
  })
})

describe('missingProbes', () => {
  const styled = '.bg-primary-solid{background-color:var(--tc-primary-solid)}.focus-visible\\:outline-\\(length\\:--tc-ring-width\\):focus-visible{outline-width: var(--tc-ring-width)}'

  it('finds both probes in CSS the library was scanned into, whatever the spacing', () => {
    expect(missingProbes(styled)).toEqual([])
    expect(missingProbes(styled.replace(': var', ':var'))).toEqual([])
  })

  it('names what a consumer build without the @source scan lacks', () => {
    expect(missingProbes(':root{--tc-ring-width:2px;--tc-primary-solid:#000}.p-8{padding:2rem}')).toEqual([
      '.bg-primary-solid',
      'outline-width:var(--tc-ring-width)',
    ])
  })

  it('a token declaration alone is not the ring: the utility must be there', () => {
    expect(missingProbes('.bg-primary-solid{} :root{--tc-ring-width:2px}')).toEqual(['outline-width:var(--tc-ring-width)'])
  })
})

describe('serverCommand', () => {
  it('starts next on the given port and address through node', () => {
    expect(serverCommand('next', 4625)).toEqual(['node_modules/next/dist/bin/next', 'start', '-p', '4625', '-H', '127.0.0.1'])
  })

  it('previews the vite build on the given port and refuses another', () => {
    expect(serverCommand('vite', 4626)).toEqual([
      'node_modules/vite/bin/vite.js', 'preview', '--port', '4626', '--host', '127.0.0.1', '--strictPort',
    ])
  })
})

describe('newestTarball', () => {
  it('picks the newest .tgz and ignores other files', () => {
    expect(newestTarball([
      { name: 'topclassui-0.0.0.tgz', mtimeMs: 100 },
      { name: 'topclassui-0.1.0-beta.0.tgz', mtimeMs: 300 },
      { name: 'notes.txt', mtimeMs: 900 },
    ])).toBe('topclassui-0.1.0-beta.0.tgz')
  })

  it('is null when nothing was packed', () => {
    expect(newestTarball([{ name: 'notes.txt', mtimeMs: 1 }])).toBeNull()
    expect(newestTarball([])).toBeNull()
  })
})

describe('stepTitles', () => {
  it('lists the nine steps of the floors run, with its port', () => {
    expect(stepTitles({ name: 'next-floors', template: 'next', floors: true }, 4627)).toEqual([
      'copy consumers/next to a fresh temp folder',
      'write package.json: the pinned versions, the floors of floors.json, topclassui from the tarball',
      'npm install',
      'npm run build (next build)',
      'tsc --noEmit: the @ts-expect-error over <Button variant="nope" /> must hold',
      'the built CSS under .next/static holds .bg-primary-solid and outline-width:var(--tc-ring-width)',
      'start the server at http://127.0.0.1:4627',
      'playwright test scripts/consumer-smoke: the components render with the library\'s computed styles',
      'stop the server and delete the folder',
    ])
  })

  it('the vite run builds with vite and reads dist/assets', () => {
    const titles = stepTitles({ name: 'vite', template: 'vite', floors: false }, 4626)
    expect(titles[1]).toBe('write package.json: the pinned versions, topclassui from the tarball')
    expect(titles[3]).toBe('npm run build (vite build)')
    expect(titles[5]).toBe('the built CSS under dist/assets holds .bg-primary-solid and outline-width:var(--tc-ring-width)')
  })
})
