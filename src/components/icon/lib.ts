// R-7-1: the only file that may import the loader map, so it can never reach a browser.
import type { IconName } from '#icons/names.generated.js'
import { LOADERS } from '#icons/loaders.generated.js'
import type { IconData } from '#icons/types.js'

const cache = new Map<IconName, IconData>()

/** Cached per process, so an icon used on many pages is loaded once. */
export async function loadIcon(name: IconName): Promise<IconData> {
  const hit = cache.get(name)
  if (hit) return hit
  const data = await LOADERS[name]()
  cache.set(name, data)
  return data
}
