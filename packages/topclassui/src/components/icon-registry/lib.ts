// No React here: registerIcons runs in any browser module, and client.tsx reads the same Map in the same module graph.
import type { IconName } from '#icons/names.generated.js'
import type { IconData } from '#icons/types.js'
import { MISSING } from './constants.js'

/** Nothing is registered until the app calls registerIcons, so no path data is implied. */
const registry = new Map<IconName, IconData>()

const warned = new Set<IconName>()

/** The export name the per-icon module uses, so the warning can name the real import. */
export function camelCase(name: string): string {
  const [first = '', ...rest] = name.split('-')
  return first + rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

export function registerIcons(icons: Partial<Record<IconName, IconData>>): void {
  for (const name of Object.keys(icons) as IconName[]) {
    const data: IconData | undefined = icons[name]
    if (data) registry.set(name, data)
  }
}

export function registeredIcons(): ReadonlySet<IconName> {
  return new Set(registry.keys())
}

/** The registered data for a name, or an empty icon that warns once per name in development. */
export function resolveIcon(name: IconName): IconData {
  const icon = registry.get(name)

  if (!icon && process.env.NODE_ENV !== 'production' && !warned.has(name)) {
    warned.add(name)
    const local = camelCase(name)
    console.warn(
      `[topclassui] <Icon name="${name}"> is not registered, so it renders empty.\n`
      + `  import { ${local} } from 'topclassui/icons/${name}'\n`
      + `  registerIcons({ '${name}': ${local} })`,
    )
  }

  return icon ?? MISSING
}
