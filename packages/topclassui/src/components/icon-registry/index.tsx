// R-5.1-2: re-exports only. The registry lives in lib.ts so registerIcons and the client <Icon> share one Map.
export { Icon } from './client.js'
export { registerIcons, registeredIcons } from './lib.js'
export type { IconProps } from './types.js'
