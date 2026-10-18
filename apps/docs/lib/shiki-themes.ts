// The Shiki pair picked by the contrast test (docs-site S3, choice 14): CodeBlock is dark in light and ocean, light in dark.
import type { ThemeRegistrationRaw } from 'shiki'
import githubDarkDefault from 'shiki/themes/github-dark-default.mjs'
import githubLightHighContrast from 'shiki/themes/github-light-high-contrast.mjs'

/** github-light-high-contrast's comment grey is 4.62:1 on neutral-100, under 4.5 plus the repo's 0.15 margin. */
const LIGHT_COMMENT = { from: '#66707b', to: '#4b535d' } as const

function recolor(theme: ThemeRegistrationRaw, from: string, to: string, name: string): ThemeRegistrationRaw {
  return {
    ...theme,
    name,
    tokenColors: (theme.tokenColors ?? []).map((rule) =>
      rule.settings.foreground?.toLowerCase() === from ? { ...rule, settings: { ...rule.settings, foreground: to } } : rule),
  }
}

export const ON_DARK = { ...githubDarkDefault, name: 'on-dark' } as ThemeRegistrationRaw
export const ON_LIGHT = recolor(githubLightHighContrast, LIGHT_COMMENT.from, LIGHT_COMMENT.to, 'on-light')

/** The languages the site's fences and demos use; anything else renders as plain text. */
export const LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'bash', 'json', 'html'] as const
