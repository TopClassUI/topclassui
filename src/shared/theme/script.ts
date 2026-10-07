/** The modes a stored value is checked against, so a stale one cannot leave the page broken. */
export const BUILT_IN_MODES = ['light', 'dark', 'ocean'] as const
export type BuiltInMode = (typeof BUILT_IN_MODES)[number]

export const THEME_STORAGE_KEY = 'tc-theme'

/** Runs before first paint, so the page never flashes the wrong mode. A cookie read
 * on the server would make every page dynamic, costing caching and SEO. */
export const THEME_SCRIPT =
  `(function(){try{var m=["light","dark","ocean"];var t=null;` +
  // Its own try: a blocked localStorage threw past the fallback and set no mode at all.
  `try{t=localStorage.getItem('tc-theme')}catch(e){}` +
  `if(!t||t==='system'||m.indexOf(t)<0){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}` +
  `document.documentElement.dataset.theme=t}catch(e){}})()`
