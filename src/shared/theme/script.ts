/** The modes a stored value is checked against, so a stale one cannot leave the page broken. */
export const BUILT_IN_MODES = ['light', 'dark', 'ocean'] as const
export type BuiltInMode = (typeof BUILT_IN_MODES)[number]

export const THEME_STORAGE_KEY = 'tc-theme'

/**
 * Runs while the browser parses the head, before first paint, so the page never
 * flashes the wrong mode. Reading a cookie on the server would make every page
 * dynamic, which costs caching and SEO.
 */
export const THEME_SCRIPT =
  `(function(){try{var m=["light","dark","ocean"];var t=localStorage.getItem('tc-theme');` +
  `if(!t||t==='system'||m.indexOf(t)<0){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}` +
  `document.documentElement.dataset.theme=t}catch(e){}})()`
