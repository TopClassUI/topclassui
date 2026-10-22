import type { GuideLabels } from './guides-types'

export const guidesEn: GuideLabels = {
  tokens: {
    swatch: 'Swatch',
    modes: { light: 'Light', dark: 'Dark', ocean: 'Ocean' },
    mix: (percent) => `${String(percent)}% into the page`,
    contrast: (ratio, min) => `${ratio.toFixed(2)}:1, needs ${String(min)}:1`,
    notMeasured: 'Not measured: a surface or a decorative line',
  },
  sample: { title: 'topclassui/tokens.css' },
  controls: {
    label: 'Knobs for this page',
    radius: 'Radius (rem)',
    density: 'Density',
    note: 'The sliders set --tc-radius and --tc-density on this page only. The mode switch is in the top bar.',
  },
  board: {
    label: 'An example screen, each part labelled with the class that paints it',
    brand: 'TopClass UI',
    title: 'Project settings',
    lead: 'Choose how this project deploys.',
    save: 'Save',
    options: ['Production', 'Preview', 'Development'],
  },
  icons: {
    search: (total) => `Search ${String(total)} icons`,
    filter: 'Show',
    all: 'All',
    directional: 'Directional',
    solid: 'Solid',
    results: (count) => (count === 1 ? '1 result' : `${String(count)} results`),
    copy: (name) => `Copy the code for ${name}`,
    copied: (code) => `Copied ${code}`,
    failed: 'The browser did not allow copying. Select the name and copy it instead.',
  },
  island: {
    page: 'In the page mode',
    scoped: 'Inside data-theme="ocean"',
    email: 'Email',
    save: 'Save',
  },
  pair: { ltr: 'dir="ltr"', rtl: 'dir="rtl"' },
  kinds: (server, split, client, total) =>
    `Of the ${String(total)} component imports today: ${String(server)} server, ${String(split)} split and ${String(client)} client, read from each component's meta.ts.`,
  changelog: {
    empty: 'Nothing has been released yet. The first entry appears here when the package is published.',
    groups: {},
    entriesNote: null,
  },
}
