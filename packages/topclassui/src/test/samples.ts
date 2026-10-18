// Inside the repo 'topclassui/<x>' would resolve the package into dist, stale or missing, so a sample is pointed at src.

/** The published subpaths that are not a component folder. */
const HOMES: Record<string, string> = {
  provider: '#shared/provider/provider.js',
  theme: '#shared/theme/theme-script.js',
  cn: '#shared/cn.js',
  classes: '#shared/classes.js',
  icons: '#icons/index.js',
}

function homeOf(subpath: string): string {
  const fixed = HOMES[subpath]
  if (fixed !== undefined) return fixed
  const [head, ...rest] = subpath.split('/')
  const tail = rest.join('/')
  if (head === 'labels' && tail !== '') return `#shared/labels/${tail}.js`
  if (head === 'icons' && tail !== '') return `#icons/data/${tail}.js`
  if (head === 'schemas' && tail !== '') return `#components/${tail}/schema.js`
  if (head === 'meta' && tail !== '') return `#components/${tail}/meta.js`
  return `#components/${subpath}/index.js`
}

/** Rewrites every `'topclassui/<x>'` to the repo module it stands for, and throws on any `topclassui` import left. */
export function importsFromRepo(code: string): string {
  const out = code.replace(/(['"])topclassui\/([^'"\n]+)\1/g, (_match, quote: string, subpath: string) => `${quote}${homeOf(subpath)}${quote}`)
  const left = /(['"])topclassui(?:\/[^'"\n]*)?\1/.exec(out)
  if (left !== null) {
    throw new Error(`importsFromRepo: ${left[0]} is not a subpath this repo can map; a sample imports from 'topclassui/<slug>'.`)
  }
  return out
}
