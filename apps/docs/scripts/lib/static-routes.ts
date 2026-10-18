// S13 step 4: every route the build made is static or SSG; one Next would render on request fails the site.
export interface Manifests {
  /** .next/app-path-routes-manifest.json: every app route. */
  appRoutes: Record<string, string>
  /** .next/prerender-manifest.json: what was prerendered, and each dynamic segment's fallback. */
  prerender: { routes: Record<string, unknown>; dynamicRoutes: Record<string, { fallback: unknown }> }
}

/** The routes that are neither prerendered nor an SSG segment with `dynamicParams = false`. */
export function dynamicRoutes({ appRoutes, prerender }: Manifests): string[] {
  return Object.values(appRoutes).filter((route) => {
    if (route in prerender.routes) return false
    const segment = prerender.dynamicRoutes[route]
    return segment === undefined || segment.fallback !== false
  }).sort()
}

/** The prerendered paths a release needs, which the build did not write. */
export function missingRoutes({ prerender }: Manifests, required: readonly string[]): string[] {
  return required.filter((path) => !(path in prerender.routes))
}
