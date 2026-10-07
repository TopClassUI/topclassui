import type { IconName } from '#icons/names.generated.js'
import type { IconData } from '#icons/types.js'
import { Svg } from '#components/svg/index.js'
import { MISSING } from './constants.js'
import { camelCase } from './lib.js'
import type { IconProps } from './types.js'

export type { IconProps } from './types.js'

/** Nothing is registered until the app calls registerIcons, so no path data is implied. */
const registry = new Map<IconName, IconData>()

const warned = new Set<IconName>()

export function registerIcons(icons: Partial<Record<IconName, IconData>>): void {
  for (const name of Object.keys(icons) as IconName[]) {
    const data: IconData | undefined = icons[name]
    if (data) registry.set(name, data)
  }
}

export function registeredIcons(): ReadonlySet<IconName> {
  return new Set(registry.keys())
}

/** R-5.1-5: the browser-only twin of the server `<Icon>`, with the identical props. */
export function Icon({ name, ...rest }: IconProps) {
  const icon = registry.get(name)

  if (!icon && process.env.NODE_ENV !== 'production' && !warned.has(name)) {
    warned.add(name)
    const local = camelCase(name)
    console.warn(
      `[topclassui] <Icon name="${name}"> is not registered, so it renders empty.\n`
      + `  import { ${local} } from 'topclassui/icons/${name}'\n`
      + `  registerIcons({ '${name}': ${local} })\n`
      + '  or run npx topclassui icons scan to generate the registration file.',
    )
  }

  return <Svg icon={icon ?? MISSING} {...rest} />
}
